package com.trade.api_gateway.filters;

import com.trade.api_gateway.JwtService;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtService jwtService;
    public AuthenticationFilter(JwtService JwtService) {
        super(Config.class);
        this.jwtService = JwtService;
    }

    public static class Config {
        // Put configuration properties here
    }

    @Override
    public GatewayFilter apply(Config config) {
        log.info("Inside AuthenticationFilter.apply method");
        return (exchange, chain) -> {
            // Put your filter logic here
            log.info("Logging request: {} {}", exchange.getRequest().getMethod(), exchange.getRequest().getURI());

            final String tokenHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

            if (!tokenHeader.startsWith("Bearer ")) {
                log.error("Authorization header is missing in the request");
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // Continue to the next filter in the chain
            String token = tokenHeader.split("Bearer ")[1];

            try{
                String userId = jwtService.getUserIdFromToken(token);
                ServerWebExchange modifiedExchange = exchange
                        .mutate()
                        .request(r->r.header("X-User-Id", userId))
                        .build();


                return chain.filter(modifiedExchange);
            }
            catch (JwtException e){
                log.error("Invalid token: {}", e.getMessage());
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();

            }
        };
    }

}
