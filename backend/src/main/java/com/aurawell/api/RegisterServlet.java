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

public class RegisterServlet extends HttpServlet {
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
        String firstName = requestBody.get("firstName").getAsString();
        String lastName = requestBody.get("lastName").getAsString();

        JsonObject jsonResponse = new JsonObject();
        PrintWriter out = response.getWriter();

        // Check if email already exists
        if (dataManager.getUserByEmail(email) != null) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Email already registered");
            out.write(gson.toJson(jsonResponse));
            out.flush();
            return;
        }

        User newUser = new User(email, password, firstName, lastName);
        User createdUser = dataManager.createUser(newUser);

        if (createdUser != null) {
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", createdUser.getId());
            session.setAttribute("userRole", createdUser.getRole());

            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Registration successful");
            
            JsonObject userData = new JsonObject();
            userData.addProperty("id", createdUser.getId());
            userData.addProperty("email", createdUser.getEmail());
            userData.addProperty("firstName", createdUser.getFirstName());
            userData.addProperty("lastName", createdUser.getLastName());
            userData.addProperty("role", createdUser.getRole());
            jsonResponse.add("user", userData);
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Registration failed");
        }

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

