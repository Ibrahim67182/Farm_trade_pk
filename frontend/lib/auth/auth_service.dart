import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
//import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../utils/secure_storage.dart';
import '../config/api.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    clientId: ApiConfig.googleClientId,
  );

  /// 🔹 Sign In with Google
  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      GoogleSignInAccount? account = await _googleSignIn.signInSilently();
      account ??= await _googleSignIn.signIn();

      if (account == null) {
        return {'success': false, 'message': 'User cancelled sign-in.'};
      }

      final auth = await account.authentication;
      final idToken = auth.idToken;

      if (idToken == null) {
        return {
          'success': false,
          'message': 'No ID token found. Please try again.',
        };
      }

      final signInUrl = ApiConfig.baseUrl;

      final res = await http.post(
        Uri.parse(signInUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"token": idToken}),
      );

      final data = jsonDecode(res.body);

      if (res.statusCode == 200 && data['success'] == true) {
        final user = data['user'];
        final token = data['token'];
        final userId = user['email'];

        //test api by printing token of user
        // print("Token : $token");

        // ✅ Save data securely
        await secureStorage.write(key: 'jwt_token_$userId', value: token);
        await secureStorage.write(
          key: 'user_email_$userId',
          value: user['email'],
        );
        await secureStorage.write(
          key: 'user_name_$userId',
          value: user['name'],
        );
        await secureStorage.write(
          key: 'user_picture_$userId',
          value: user['picture'],
        );

        return {'success': true, 'user': user};
      } else {
        return {'success': false, 'message': data['error'] ?? 'Unknown error'};
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// 🔹 Sign Out
  Future<void> signOut(String? email) async {
    try {
      await _googleSignIn.signOut();

      if (email != null) {
        await secureStorage.delete(key: 'jwt_token_$email');
        await secureStorage.delete(key: 'user_email_$email');
        await secureStorage.delete(key: 'user_name_$email');
        await secureStorage.delete(key: 'user_picture_$email');
      }
    } catch (e) {
      // Ignore disconnect errors
    }
  }

  /// 🔹 Check if user is already logged in
  Future<Map<String, dynamic>?> getLoggedInUser() async {
    try {
      // Get all stored keys
      final all = await secureStorage.readAll();

      // Find user email from stored data (assuming only one active session)
      final emailEntry = all.keys.firstWhere(
        (key) => key.startsWith('user_email_'),
        orElse: () => '',
      );

      if (emailEntry.isEmpty) return null;

      final email = all[emailEntry]!;
      final name = await secureStorage.read(key: 'user_name_$email');
      final picture = await secureStorage.read(key: 'user_picture_$email');
      final token = await secureStorage.read(key: 'jwt_token_$email');

      if (token != null && token.isNotEmpty) {
        return {
          'email': email,
          'name': name ?? '',
          'picture': picture,
          'token': token,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
