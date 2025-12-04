package com.aurawell.api;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CorsFilter implements Filter {
    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_YELLOW = "\u001B[33m";
    private static final String ANSI_BLUE = "\u001B[34m";
    private static final String ANSI_PURPLE = "\u001B[35m";
    private static final String ANSI_CYAN = "\u001B[36m";
    private static final String ANSI_RED = "\u001B[31m";
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("\n" + ANSI_GREEN + "╔════════════════════════════════════════════════════════╗");
        System.out.println("║          AuraWell API Server Started                   ║");
        System.out.println("║              http://localhost:9090                     ║");
        System.out.println("╚════════════════════════════════════════════════════════╝" + ANSI_RESET + "\n");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        long startTime = System.currentTimeMillis();

        // Set CORS headers
        httpResponse.setHeader("Access-Control-Allow-Origin", "https://aura-well-two.vercel.app");
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");

        // Handle preflight
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        httpResponse.setContentType("application/json");
        httpResponse.setCharacterEncoding("UTF-8");

        // Log the request
        String method = httpRequest.getMethod();
        String uri = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();
        String fullPath = queryString != null ? uri + "?" + queryString : uri;
        
        // Get session info
        HttpSession session = httpRequest.getSession(false);
        String sessionInfo = session != null ? session.getAttribute("userId") != null ? 
            "user:" + session.getAttribute("userId").toString().substring(0, 8) + "..." : "anonymous" : "no-session";
        
        // Color code by method
        String methodColor = switch (method) {
            case "GET" -> ANSI_GREEN;
            case "POST" -> ANSI_YELLOW;
            case "PUT" -> ANSI_BLUE;
            case "DELETE" -> ANSI_RED;
            default -> ANSI_CYAN;
        };
        
        String timestamp = LocalDateTime.now().format(formatter);
        
        System.out.println(ANSI_PURPLE + "[" + timestamp + "]" + ANSI_RESET + " " +
                           methodColor + String.format("%-6s", method) + ANSI_RESET + " " +
                           ANSI_CYAN + fullPath + ANSI_RESET + " " +
                           ANSI_PURPLE + "(" + sessionInfo + ")" + ANSI_RESET);

        // Process the request
        chain.doFilter(request, response);
        
        // Log response time
        long duration = System.currentTimeMillis() - startTime;
        int status = httpResponse.getStatus();
        String statusColor = status >= 200 && status < 300 ? ANSI_GREEN : 
                            status >= 400 ? ANSI_RED : ANSI_YELLOW;
        
        System.out.println(ANSI_PURPLE + "         └─► " + ANSI_RESET + 
                           statusColor + status + ANSI_RESET + " " +
                           ANSI_CYAN + "(" + duration + "ms)" + ANSI_RESET);
    }

    @Override
    public void destroy() {
        System.out.println(ANSI_RED + "\n🛑 AuraWell API Server Stopped" + ANSI_RESET);
    }
}
