import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import '../auth/auth_service.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();

  bool _loading = false;

  Future<void> _handleGoogleSignIn() async {
    try {
      setState(() {
        _loading = true;
      });

      final result = await _authService.signInWithGoogle();

      if (!mounted) return;
      setState(() => _loading = false);

      // ✅ Ignore user-cancelled sign-in
      if (result['success'] == false &&
          (result['message']?.toLowerCase().contains('cancel') ?? false)) {
        _showSnackBar("Google sign-in cancelled.", Colors.orangeAccent);
        return;
      }

      if (result['success'] == true) {
        final user = result['user'];
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => DashboardScreen(
              name: user['name'],
              email: user['email'],
              picture: user['picture'],
            ),
          ),
        );
      } else {
        _showSnackBar(
          result['message'] ?? "Sign-in failed. Please try again.",
          Colors.redAccent,
        );
      }
    } on SocketException {
      // 🌐 No internet or network issue
      if (mounted) {
        setState(() => _loading = false);
        _showSnackBar(
          "No internet connection. Please check your Wi-Fi.",
          Colors.redAccent,
        );
      }
    } on HttpException {
      // 🛰️ Server-side failure
      if (mounted) {
        setState(() => _loading = false);
        _showSnackBar(
          "Unable to connect to Google. Please try again later.",
          Colors.redAccent,
        );
      }
    } on FormatException {
      // 🧩 Response format issue
      if (mounted) {
        setState(() => _loading = false);
        _showSnackBar("Unexpected response from server.", Colors.redAccent);
      }
    } catch (e) {
      // 🚫 Generic fallback
      if (mounted) {
        setState(() => _loading = false);
        _showSnackBar(
          "Something went wrong. Please try again.",
          Colors.redAccent,
        );
      }
      debugPrint("Error during Google sign-in: $e");
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [Color(0xFF010117), Color(0xFF151570), Color(0xFF198A9C)],
            stops: [0.0, 0.35, 1.0],
          ),
        ),
        child: Center(
          child: _loading
              ? const CircularProgressIndicator(color: Colors.white)
              : SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Welcome to Farm Trade",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Manage your farm stocks & trades efficiently.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.white70,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 30),
                      _buildLoginCard(context),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildLoginCard(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: MediaQuery.of(context).size.width * 0.78,
          padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 32),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.12),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.25),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Sign In",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "Sign in with your Google account to continue",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: Colors.white70),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _handleGoogleSignIn,
                  icon: Image.asset(
                    'assets/images/google_logo.png',
                    height: 28,
                  ),
                  label: const Text(
                    "Sign in with Google",
                    style: TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w600,
                      fontSize: 17,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    elevation: 2,
                    backgroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: 14,
                      horizontal: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(40),
                      side: const BorderSide(color: Colors.black12, width: 1),
                    ),
                  ),
                ),
              ),

              Image.asset(
                'assets/images/main_logo_small.png',
                height: 110,
                color: Colors.white,
              ),
              const Text(
                "Enhance Your Transaction Management Experience",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white70,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
