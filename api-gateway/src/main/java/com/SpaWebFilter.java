package com;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SpaWebFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. Never intercept backend API routes
        if (path.startsWith("/api")
                || path.startsWith("/actuator")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")) {
            return chain.filter(exchange);
        }

        // 2. Never intercept static assets with extensions (.js, .css, .png, .jpg, .ico, etc.) except html
        if (path.contains(".") && !path.endsWith(".html")) {
            return chain.filter(exchange);
        }

        // 3. Already requesting index.html
        if ("/index.html".equals(path)) {
            return chain.filter(exchange);
        }

        // 4. Forward all Angular SPA client-side routes to index.html
        return chain.filter(
                exchange.mutate()
                        .request(exchange.getRequest().mutate().path("/index.html").build())
                        .build()
        );
    }
}
