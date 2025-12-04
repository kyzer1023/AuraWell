package com.aurawell.services;

import com.aurawell.models.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class DataManager {
    private static DataManager instance;
    
    // Directory for persistent data storage (writable in production)
    private static final String DATA_DIR;
    private static final String USERS_FILE;
    private static final String PRODUCTS_FILE;
    private static final String CARTS_FILE;
    private static final String ORDERS_FILE;
    
    static {
        // Use environment variable or fallback to local path
        String baseDir = System.getenv("DATA_DIR");
        if (baseDir == null || baseDir.isEmpty()) {
            baseDir = System.getProperty("user.dir") + "/data";
        }
        DATA_DIR = baseDir + "/";
        USERS_FILE = DATA_DIR + "users.json";
        PRODUCTS_FILE = DATA_DIR + "products.json";
        CARTS_FILE = DATA_DIR + "carts.json";
        ORDERS_FILE = DATA_DIR + "orders.json";
    }

    private final Gson gson;
    private List<User> users;
    private List<Product> products;
    private List<Cart> carts;
    private List<Order> orders;

    private DataManager() {
        gson = new GsonBuilder().setPrettyPrinting().create();
        initializeDataDirectory();
        loadData();
    }
    
    private void initializeDataDirectory() {
        try {
            Files.createDirectories(Paths.get(DATA_DIR));
            // Copy initial data from classpath if files don't exist
            copyInitialDataIfNeeded("users.json", USERS_FILE);
            copyInitialDataIfNeeded("products.json", PRODUCTS_FILE);
            copyInitialDataIfNeeded("carts.json", CARTS_FILE);
            copyInitialDataIfNeeded("orders.json", ORDERS_FILE);
        } catch (IOException e) {
            System.err.println("Failed to initialize data directory: " + e.getMessage());
        }
    }
    
    private void copyInitialDataIfNeeded(String resourceName, String targetFile) {
        File target = new File(targetFile);
        if (!target.exists()) {
            try (InputStream is = getClass().getClassLoader().getResourceAsStream("data/" + resourceName)) {
                if (is != null) {
                    Files.copy(is, target.toPath());
                    System.out.println("Initialized " + resourceName + " from classpath");
                } else {
                    // Create empty file if no initial data
                    Files.writeString(target.toPath(), "[]");
                    System.out.println("Created empty " + resourceName);
                }
            } catch (IOException e) {
                System.err.println("Failed to copy initial data for " + resourceName + ": " + e.getMessage());
            }
        }
    }

    public static synchronized DataManager getInstance() {
        if (instance == null) {
            instance = new DataManager();
        }
        return instance;
    }

    private void loadData() {
        users = loadFromFile(USERS_FILE, new TypeToken<List<User>>(){}.getType());
        products = loadFromFile(PRODUCTS_FILE, new TypeToken<List<Product>>(){}.getType());
        carts = loadFromFile(CARTS_FILE, new TypeToken<List<Cart>>(){}.getType());
        orders = loadFromFile(ORDERS_FILE, new TypeToken<List<Order>>(){}.getType());

        if (users == null) users = new ArrayList<>();
        if (products == null) products = new ArrayList<>();
        if (carts == null) carts = new ArrayList<>();
        if (orders == null) orders = new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    private <T> T loadFromFile(String filename, Type type) {
        try {
            File file = new File(filename);
            if (!file.exists()) {
                return null;
            }
            try (Reader reader = new FileReader(file)) {
                return gson.fromJson(reader, type);
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void saveToFile(String filename, Object data) {
        try {
            try (Writer writer = new FileWriter(filename)) {
                gson.toJson(data, writer);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // User operations
    public List<User> getUsers() { return new ArrayList<>(users); }

    public User getUserById(String id) {
        return users.stream().filter(u -> u.getId().equals(id)).findFirst().orElse(null);
    }

    public User getUserByEmail(String email) {
        return users.stream().filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst().orElse(null);
    }

    public User authenticateUser(String email, String password) {
        User user = getUserByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    public User createUser(User user) {
        if (getUserByEmail(user.getEmail()) != null) {
            return null; // Email already exists
        }
        users.add(user);
        saveUsers();
        return user;
    }

    public void saveUsers() { saveToFile(USERS_FILE, users); }

    // Product operations
    public List<Product> getProducts() { return new ArrayList<>(products); }

    public List<Product> getProductsByCategory(String category) {
        return products.stream()
            .filter(p -> p.getCategory().equalsIgnoreCase(category))
            .toList();
    }

    public Product getProductById(String id) {
        return products.stream().filter(p -> p.getId().equals(id)).findFirst().orElse(null);
    }

    public Product createProduct(Product product) {
        products.add(product);
        saveProducts();
        return product;
    }

    public Product updateProduct(String id, Product updatedProduct) {
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getId().equals(id)) {
                updatedProduct.setId(id);
                updatedProduct.setCreatedAt(products.get(i).getCreatedAt());
                products.set(i, updatedProduct);
                saveProducts();
                return updatedProduct;
            }
        }
        return null;
    }

    public boolean deleteProduct(String id) {
        boolean removed = products.removeIf(p -> p.getId().equals(id));
        if (removed) saveProducts();
        return removed;
    }

    public void saveProducts() { saveToFile(PRODUCTS_FILE, products); }

    // Cart operations
    public Cart getCartByUserId(String userId) {
        Cart cart = carts.stream().filter(c -> c.getUserId().equals(userId)).findFirst().orElse(null);
        if (cart == null) {
            cart = new Cart(userId);
            carts.add(cart);
            saveCarts();
        }
        return cart;
    }

    public Cart updateCart(Cart cart) {
        for (int i = 0; i < carts.size(); i++) {
            if (carts.get(i).getUserId().equals(cart.getUserId())) {
                carts.set(i, cart);
                saveCarts();
                return cart;
            }
        }
        carts.add(cart);
        saveCarts();
        return cart;
    }

    public void clearCart(String userId) {
        Cart cart = getCartByUserId(userId);
        cart.clear();
        saveCarts();
    }

    public void saveCarts() { saveToFile(CARTS_FILE, carts); }

    // Order operations
    public List<Order> getOrders() { return new ArrayList<>(orders); }

    public List<Order> getOrdersByUserId(String userId) {
        return orders.stream().filter(o -> o.getUserId().equals(userId)).toList();
    }

    public Order getOrderById(String id) {
        return orders.stream().filter(o -> o.getId().equals(id)).findFirst().orElse(null);
    }

    public Order createOrder(Order order) {
        orders.add(order);
        saveOrders();
        return order;
    }

    public Order updateOrderStatus(String orderId, String status) {
        Order order = getOrderById(orderId);
        if (order != null) {
            order.setStatus(status);
            saveOrders();
        }
        return order;
    }

    public void saveOrders() { saveToFile(ORDERS_FILE, orders); }
}

