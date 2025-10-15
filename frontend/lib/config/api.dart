import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static final String baseUrl = dotenv.env['SIGNIN_API_BASE_URL'] ?? '';
  static final String googleClientId = dotenv.env['WEB_CLIENT_ID'] ?? '';
}
