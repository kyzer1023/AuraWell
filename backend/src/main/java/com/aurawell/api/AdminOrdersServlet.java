package com.aurawell.api;

import com.aurawell.models.Order;
import com.aurawell.services.DataManager;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

public class AdminOrdersServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        String role = (String) session.getAttribute("userRole");
        return "admin".equals(role);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        PrintWriter out = response.getWriter();

        if (!isAdmin(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Admin access required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        List<Order> orders = dataManager.getOrders();
        out.write(gson.toJson(orders));
        out.flush();
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        PrintWriter out = response.getWriter();

        if (!isAdmin(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Admin access required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        JsonObject requestBody = gson.fromJson(sb.toString(), JsonObject.class);
        String orderId = requestBody.get("orderId").getAsString();
        String status = requestBody.get("status").getAsString();

        Order updatedOrder = dataManager.updateOrderStatus(orderId, status);

        JsonObject jsonResponse = new JsonObject();
        if (updatedOrder != null) {
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Order status updated");
            jsonResponse.add("order", gson.toJsonTree(updatedOrder));
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("error", "Order not found");
        }

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

