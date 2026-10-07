import 'dart:async';
import 'package:flutter/material.dart';

class FakeCallScreen extends StatefulWidget {
  const FakeCallScreen({Key? key}) : super(key: key);

  @override
  State<FakeCallScreen> createState() => _FakeCallScreenState();
}

class _FakeCallScreenState extends State<FakeCallScreen> {
  bool _isConnected = false;
  int _callDuration = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _acceptCall() {
    setState(() {
      _isConnected = true;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _callDuration++;
      });
    });
  }

  void _declineCall() {
    _timer?.cancel();
    Navigator.pop(context);
  }

  String _formatDuration(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const SizedBox(height: 30),
            // Caller Info
            Column(
              children: [
                Text(
                  _isConnected ? 'Connected' : 'Incoming Call...',
                  style: const TextStyle(color: Colors.white60, fontSize: 14),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Mom',
                  style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  _isConnected ? _formatDuration(_callDuration) : '+91 98200 12345',
                  style: const TextStyle(color: Colors.white70, fontSize: 16),
                ),
              ],
            ),

            // Caller Avatar
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF1E293B),
                border: Border.all(color: const Color(0xFF334155), width: 2),
              ),
              alignment: Alignment.center,
              child: const Text('M', style: TextStyle(color: Colors.white, fontSize: 50, fontWeight: FontWeight.bold)),
            ),

            // Call Action Buttons
            Padding(
              padding: const EdgeInsets.only(bottom: 40.0),
              child: _isConnected
                  ? Center(
                      child: Column(
                        children: [
                          FloatingActionButton(
                            onPressed: _declineCall,
                            backgroundColor: Colors.red,
                            child: const Icon(Icons.call_end, color: Colors.white, size: 30),
                          ),
                          const SizedBox(height: 8),
                          const Text('End Call', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ],
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            FloatingActionButton(
                              heroTag: 'decline_btn',
                              onPressed: _declineCall,
                              backgroundColor: Colors.red,
                              child: const Icon(Icons.call_end, color: Colors.white, size: 30),
                            ),
                            const SizedBox(height: 8),
                            const Text('Decline', style: TextStyle(color: Colors.white, fontSize: 13)),
                          ],
                        ),
                        Column(
                          children: [
                            FloatingActionButton(
                              heroTag: 'accept_btn',
                              onPressed: _acceptCall,
                              backgroundColor: Colors.green,
                              child: const Icon(Icons.call, color: Colors.white, size: 30),
                            ),
                            const SizedBox(height: 8),
                            const Text('Accept', style: TextStyle(color: Colors.white, fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
