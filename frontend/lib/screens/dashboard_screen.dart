//import 'dart:ui';
import 'package:flutter/material.dart';
import '../auth/auth_service.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  final String name;
  final String email;
  final String? picture;

  const DashboardScreen({
    super.key,
    required this.name,
    required this.email,
    this.picture,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  final AuthService _authService = AuthService();
  bool _loading = false;
  late AnimationController _controller;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scaleAnim = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutBack,
    );
  }

  Future<void> _handleLogout() async {
    setState(() => _loading = true);
    await _authService.signOut(widget.email);

    if (!mounted) return;
    setState(() => _loading = false);

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  void _showProfileDropdown(BuildContext context, Offset position) async {
    final overlay = Overlay.of(context);
    if (overlay == null) return;

    late OverlayEntry overlayEntry;

    overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        left: position.dx - 150,
        top: position.dy + 35,
        child: FadeTransition(
          opacity: _scaleAnim,
          child: ScaleTransition(
            scale: _scaleAnim,
            alignment: Alignment.topRight,
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: 200, // 🔹 smaller width
                padding: const EdgeInsets.symmetric(
                  vertical: 14,
                  horizontal: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.blueAccent, width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.6),
                      blurRadius: 8,
                      offset: const Offset(2, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.blueAccent, width: 2),
                      ),
                      child: CircleAvatar(
                        backgroundImage: widget.picture != null
                            ? NetworkImage(widget.picture!)
                            : const AssetImage(
                                    'assets/images/default_avatar.png',
                                  )
                                  as ImageProvider,
                        radius: 26, // 🔹 smaller avatar
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      widget.name,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.email,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                    const Divider(
                      color: Colors.blueAccent,
                      height: 20,
                      thickness: 0.5,
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        overlayEntry.remove();
                        _handleLogout();
                      },
                      icon: const Icon(
                        Icons.logout,
                        color: Colors.white,
                        size: 18,
                      ),
                      label: const Text(
                        "Logout",
                        style: TextStyle(color: Colors.white, fontSize: 13),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent.shade700,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 25,
                          vertical: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );

    // Animate + insert
    _controller.forward(from: 0.0);
    overlay.insert(overlayEntry);

    // Tap outside to close
    await Future.delayed(const Duration(milliseconds: 50));
    await showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (_) => GestureDetector(
        onTap: () {
          _controller.reverse();
          overlayEntry.remove();
          Navigator.pop(context);
        },
        child: Container(color: Colors.transparent),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFF009688),
        title: const Text(
          "Dashboard",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: GestureDetector(
              onTapDown: (TapDownDetails details) {
                _showProfileDropdown(context, details.globalPosition);
              },
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.blueAccent, width: 2),
                    ),
                    child: CircleAvatar(
                      backgroundImage: widget.picture != null
                          ? NetworkImage(widget.picture!)
                          : const AssetImage('assets/images/default_avatar.png')
                                as ImageProvider,
                      radius: 18,
                    ),
                  ),
                  const SizedBox(width: 5),
                  const Icon(
                    Icons.arrow_drop_down,
                    color: Colors.white,
                    size: 26,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: Center(
        child: _loading
            ? const CircularProgressIndicator(color: Colors.teal)
            : const Text(
                "Welcome to your Dashboard!",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
      ),
    );
  }
}
