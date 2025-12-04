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
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

public class LoginServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        JsonObject requestBody = gson.fromJson(sb.toString(), JsonObject.class);
        String email = requestBody.get("email").getAsString();
        String password = requestBody.get("password").getAsString();

        User user = dataManager.authenticateUser(email, password);

        JsonObject jsonResponse = new JsonObject();
        PrintWriter out = response.getWriter();

        if (user != null) {
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", user.getId());
            session.setAttribute("userRole", user.getRole());

            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Login successful");
            
            JsonObject userData = new JsonObject();
            userData.addProperty("id", user.getId());
            userData.addProperty("email", user.getEmail());
            userData.addProperty("firstName", user.getFirstName());
            userData.addProperty("lastName", user.getLastName());
            userData.addProperty("role", user.getRole());
            jsonResponse.add("user", userData);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Invalid email or password");
        }

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

