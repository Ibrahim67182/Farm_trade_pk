import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../utils/secure_storage.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    serverClientId:
        "474840931377-nv7fslc4se060ti920697b3i9e7lns08.apps.googleusercontent.com",
  );

  bool _loading = false;
  String? _response;
  String? _name;
  String? _email;
  String? _picture;

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _loading = true;
      _response = null;
    });

    try {
      // 🔹 Attempt silent sign-in first
      GoogleSignInAccount? account = await _googleSignIn.signInSilently();

      // 🔹 If silent fails, do interactive login
      account ??= await _googleSignIn.signIn();

      if (account == null) {
        setState(() {
          _response = "User cancelled sign-in.";
          _loading = false;
        });
        return;
      }

      // 🔹 Fetch fresh authentication (ID token)
      final GoogleSignInAuthentication auth = await account.authentication;

      final String? idToken = auth.idToken;
      if (idToken == null) {
        setState(() {
          _response = "No ID token found. Please try again.";
          _loading = false;
        });
        return;
      }

      // 🔹 Send token to your backend
      final res = await http.post(
        Uri.parse("http://192.168.100.40:3000/api/auth/google"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"token": idToken}),
      );

      final data = jsonDecode(res.body);

      if (res.statusCode == 200 && data['success'] == true) {
        setState(() {
          _name = data['user']['name'];
          _email = data['user']['email'];
          _picture = data['user']['picture'];
          _response = "✅ Login successful\nToken: ${data['token']}";
        });

        final userId = data['user']['email']; // or a unique ID from backend

        await secureStorage.write(
          key: 'jwt_token_$userId',
          value: data['token'],
        );
        await secureStorage.write(
          key: 'user_email_$userId',
          value: data['user']['email'],
        );
        await secureStorage.write(
          key: 'user_name_$userId',
          value: data['user']['name'],
        );
        await secureStorage.write(
          key: 'user_picture_$userId',
          value: data['user']['picture'],
        );

        // print test

        // final storedToken = await secureStorage.read(key: 'jwt_token_$userId');
        // final storedEmail = await secureStorage.read(key: 'user_email_$userId');
        // final storedName = await secureStorage.read(key: 'user_name_$userId');

        // print("User ID: $userId");
        // print("Token: $storedToken");
        // print("Email: $storedEmail");
        // print("Name: $storedName");

        //////
      } else {
        setState(() {
          _response = "❌ Error: ${data['error'] ?? 'Unknown error'}";
        });
      }
    } catch (e) {
      setState(() => _response = "⚠️ Error: $e");
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Google Sign-In Test")),
      body: Center(
        child: _loading
            ? const CircularProgressIndicator()
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_picture != null)
                      CircleAvatar(
                        backgroundImage: NetworkImage(_picture!),
                        radius: 40,
                      ),
                    const SizedBox(height: 20),
                    if (_name != null)
                      Text(
                        "Hello, $_name!",
                        style: const TextStyle(fontSize: 18),
                      ),
                    if (_email != null)
                      Text(_email!, style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: _handleGoogleSignIn,
                      icon: const Icon(Icons.login),
                      label: const Text("Sign in with Google"),
                    ),
                    const SizedBox(height: 30),
                    if (_response != null)
                      Text(
                        _response!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.blueGrey,
                        ),
                      ),
                  ],
                ),
              ),
      ),
    );
  }
}
