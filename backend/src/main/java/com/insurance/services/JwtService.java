package com.insurance.services;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.insurance.entities.UserEntity;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
    public class JwtService {

        @Value("${app.jwt.secret}")
        private String secret;

        @Value("${app.jwt.expiration:86400000}")
        private long expiration; // 24 hours default

        @Value("${app.jwt.refresh-expiration:604800000}")
        private long refreshExpiration; // 7 days default

        private Key getSigningKey() {
            return Keys.hmacShaKeyFor(secret.getBytes());
        }

        public String generateAccessToken(UserEntity user) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("email", user.getEmail());
            claims.put("role", user.getRole().getName());
            return createToken(claims, user.getEmail(), expiration);
        }

        public String generateRefreshToken(UserEntity user) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("type", "refresh");
            return createToken(claims, user.getEmail(), refreshExpiration);
        }

        public String generateVerificationToken(UserEntity user) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("type", "verification");
            // Token háº¿t háº¡n sau 24 giá»
            return createToken(claims, user.getEmail(), expiration);
        }

        private String createToken(Map<String, Object> claims, String subject, Long expiration) {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(subject)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + expiration))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        }

        public String extractUsername(String token) {
            return extractClaim(token, Claims::getSubject);
        }

        public Date extractExpiration(String token) {
            return extractClaim(token, Claims::getExpiration);
        }

        public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        }

        private Claims extractAllClaims(String token) {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }

        private Boolean isTokenExpired(String token) {
            return extractExpiration(token).before(new Date());
        }

        public Boolean validateToken(String token, UserDetails userDetails) {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        }
    }


