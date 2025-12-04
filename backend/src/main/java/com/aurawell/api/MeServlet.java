package com.aurawell.api;

import com.aurawell.models.User;
import com.aurawell.services.DataManager;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

public class MeServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        JsonObject jsonResponse = new JsonObject();
        PrintWriter out = response.getWriter();

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Not authenticated");
            out.write(gson.toJson(jsonResponse));
            out.flush();
            return;
        }

        String userId = (String) session.getAttribute("userId");
        User user = dataManager.getUserById(userId);

        if (user != null) {
            jsonResponse.addProperty("success", true);
            
            JsonObject userData = new JsonObject();
            userData.addProperty("id", user.getId());
            userData.addProperty("email", user.getEmail());
            userData.addProperty("firstName", user.getFirstName());
            userData.addProperty("lastName", user.getLastName());
            userData.addProperty("role", user.getRole());
            jsonResponse.add("user", userData);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "User not found");
        }

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

