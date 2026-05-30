package com.insurance.filters;



import java.io.IOException;

import com.insurance.services.CustomUserDetailsService;
import com.insurance.services.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String uri = request.getRequestURI();       // robust hÆ¡n servletPath
        final String method = request.getMethod();

        try {
            // 1) Bá» qua cĂ¡c path public / preflight / error
            if (isBypass(uri, method)) {
                filterChain.doFilter(request, response);
                return;
            }

            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userEmail;

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            log.info("Authorization: {}", authHeader);
            log.info("URI: {}", uri);

            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            ex.printStackTrace();
            throw ex;
        }

    }



    private boolean isBypass(String uri, String method) {
        // During testing: bypass all /api/** endpoints

        if ("OPTIONS".equals(method)) return true; // CORS preflight

//        if (uri.contains("/api/users")) return true;

        if (uri.equals("/api/users/google-login")) return true;
        if (uri.contains("/api/v1/auth/login") || uri.contains("/api/v1/auth/register")) return true;
        if (uri.endsWith("/api/v1/auth/send-otp")) return true;
        if( uri.endsWith("/api/v1/auth/verify-otp")) return true;
        if( uri.endsWith("/api/v1/auth/reset-password-otp")) return true;
        if( uri.endsWith("/api/v1/auth/refresh-token")) return true;

        if (uri.startsWith("/uploads")) return true; // áº£nh public
        if ("/error".equals(uri))     return true; // error forward

        return false;
    }
}


