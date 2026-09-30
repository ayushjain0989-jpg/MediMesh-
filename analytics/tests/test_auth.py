import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from users import DEMO_PASSWORD, authenticate


class AuthTests(unittest.TestCase):
    def test_demo_login(self):
        user, error = authenticate("PT-SUN-101", DEMO_PASSWORD, "patient")
        self.assertIsNone(error)
        self.assertEqual(user["id"], "sun-p")

    def test_wrong_role(self):
        user, error = authenticate("PT-SUN-101", DEMO_PASSWORD, "doctor")
        self.assertIsNone(user)
        self.assertIn("patient", (error or "").lower())

    def test_wrong_password(self):
        user, error = authenticate("PT-SUN-101", "nope", "patient")
        self.assertIsNone(user)


if __name__ == "__main__":
    unittest.main()
