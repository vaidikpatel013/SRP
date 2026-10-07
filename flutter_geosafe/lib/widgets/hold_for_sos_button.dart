import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/emergency_provider.dart';
import '../providers/safety_provider.dart';
import '../providers/auth_provider.dart';

class HoldForSOSButton extends StatelessWidget {
  final VoidCallback onOpenGuardian;

  const HoldForSOSButton({Key? key, required this.onOpenGuardian}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final emergency = Provider.of<EmergencyProvider>(context);
    final safety = Provider.of<SafetyProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    if (emergency.isSosActive) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFEF4444), width: 2),
        ),
        child: Column(
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.warning, color: Colors.red, size: 20),
                SizedBox(width: 8),
                Text(
                  'ACTIVE SOS • GPS STREAMING',
                  style: TextStyle(color: Color(0xFF991B1B), fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: onOpenGuardian,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E40AF)),
                    child: const Text('Guardian View', style: TextStyle(color: Colors.white)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => emergency.resolveEmergency(),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                    child: const Text('I Am Safe', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      height: 72,
      child: ElevatedButton(
        onPressed: () {
          _showCountdownDialog(context, emergency, safety, auth);
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFDC2626),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 8,
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('🚨', style: TextStyle(fontSize: 20)),
            Text(
              'HOLD FOR SOS',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCountdownDialog(
    BuildContext context,
    EmergencyProvider emergency,
    SafetyProvider safety,
    AuthProvider auth,
  ) {
    emergency.startSosCountdown(
      userId: auth.user?.uid ?? 'anon_user',
      location: safety.userLocation,
      userName: auth.user?.name,
      emergencyContact: auth.user?.emergencyContact,
    );

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return Consumer<EmergencyProvider>(
          builder: (context, emProvider, _) {
            if (!emProvider.isSosArmed) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (Navigator.canPop(ctx)) Navigator.pop(ctx);
              });
            }

            return AlertDialog(
              backgroundColor: const Color(0xFF1F2937),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: const Text(
                'DISPATCHING SOS',
                style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Streaming live coordinates to emergency contacts in:',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.red, width: 4),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${emProvider.countdownSeconds}',
                      style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      emProvider.cancelSosCountdown();
                      Navigator.pop(ctx);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey[800],
                      minimumSize: const Size.fromHeight(48),
                    ),
                    child: const Text('CANCEL SOS', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
