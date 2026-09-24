#!/usr/bin/env python3
"""
API Integration Test Script
Tests all partner depot integrations with authentication.
"""

import requests
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class IntegrationTester:
    """Test suite for all depot integrations."""

    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'summary': {
                'total': 0,
                'passed': 0,
                'failed': 0,
                'skipped': 0
            }
        }

    def log_test(self, test_name, passed, message, details=None):
        """Log test result."""
        result = {
            'test': test_name,
            'status': 'PASSED' if passed else 'FAILED',
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.results['tests'].append(result)
        self.results['summary']['total'] += 1
        if passed:
            self.results['summary']['passed'] += 1
        else:
            self.results['summary']['failed'] += 1

        status_symbol = "✓" if passed else "✗"
        print(f"{status_symbol} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")

    def test_consort_depot(self):
        """Test Consort Depot integration."""
        print("\n" + "="*60)
        print("Testing Consort Depot Integration")
        print("="*60)

        api_url = os.getenv('CONSORT_API_URL')
        api_key = os.getenv('CONSORT_API_KEY')

        if not api_url or api_key == 'your_consort_api_key_here':
            self.log_test(
                'Consort Depot - Credentials',
                False,
                'API credentials not configured',
                'Set CONSORT_API_URL and CONSORT_API_KEY in .env'
            )
            return

        # Test connection
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'X-Depot-ID': 'TZI.HLD.DEP.GNOSIS'
            }

            # Test budget utilization endpoint
            response = requests.get(
                f'{api_url}/api/v1/budget/utilization?year=2026',
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                self.log_test(
                    'Consort Depot - Connection',
                    True,
                    'Successfully connected to Consort Depot API',
                    f'Status: {response.status_code}'
                )
            elif response.status_code == 401:
                self.log_test(
                    'Consort Depot - Authentication',
                    False,
                    'Authentication failed',
                    'Check API key and permissions'
                )
            else:
                self.log_test(
                    'Consort Depot - Connection',
                    False,
                    f'Connection failed with status {response.status_code}',
                    response.text[:200]
                )

        except requests.exceptions.Timeout:
            self.log_test(
                'Consort Depot - Connection',
                False,
                'Connection timeout',
                'Check network connectivity and API URL'
            )
        except requests.exceptions.ConnectionError:
            self.log_test(
                'Consort Depot - Connection',
                False,
                'Connection error',
                'Check API URL and network connectivity'
            )
        except Exception as e:
            self.log_test(
                'Consort Depot - Connection',
                False,
                f'Unexpected error: {str(e)}',
                None
            )

    def test_cashinghouse_depot(self):
        """Test CashingHouse Depot integration."""
        print("\n" + "="*60)
        print("Testing CashingHouse Depot Integration")
        print("="*60)

        api_url = os.getenv('CASHINGHOUSE_API_URL')
        api_key = os.getenv('CASHINGHOUSE_API_KEY')

        if not api_url or api_key == 'your_cashinghouse_api_key_here':
            self.log_test(
                'CashingHouse Depot - Credentials',
                False,
                'API credentials not configured',
                'Set CASHINGHOUSE_API_URL and CASHINGHOUSE_API_KEY in .env'
            )
            return

        # Test connection
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'X-Depot-ID': 'TZI.HLD.DEP.GNOSIS'
            }

            # Test financial data endpoint
            response = requests.get(
                f'{api_url}/api/v1/financial-data',
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                self.log_test(
                    'CashingHouse Depot - Connection',
                    True,
                    'Successfully connected to CashingHouse Depot API',
                    f'Status: {response.status_code}'
                )
            elif response.status_code == 401:
                self.log_test(
                    'CashingHouse Depot - Authentication',
                    False,
                    'Authentication failed',
                    'Check API key and permissions'
                )
            else:
                self.log_test(
                    'CashingHouse Depot - Connection',
                    False,
                    f'Connection failed with status {response.status_code}',
                    response.text[:200]
                )

        except requests.exceptions.Timeout:
            self.log_test(
                'CashingHouse Depot - Connection',
                False,
                'Connection timeout',
                'Check network connectivity and API URL'
            )
        except requests.exceptions.ConnectionError:
            self.log_test(
                'CashingHouse Depot - Connection',
                False,
                'Connection error',
                'Check API URL and network connectivity'
            )
        except Exception as e:
            self.log_test(
                'CashingHouse Depot - Connection',
                False,
                f'Unexpected error: {str(e)}',
                None
            )

    def test_scribe_depot(self):
        """Test Scribe Depot integration."""
        print("\n" + "="*60)
        print("Testing Scribe Depot Integration")
        print("="*60)

        api_url = os.getenv('SCRIBE_API_URL')
        api_key = os.getenv('SCRIBE_API_KEY')

        if not api_url or api_key == 'your_scribe_api_key_here':
            self.log_test(
                'Scribe Depot - Credentials',
                False,
                'API credentials not configured',
                'Set SCRIBE_API_URL and SCRIBE_API_KEY in .env'
            )
            return

        # Test connection
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'X-Depot-ID': 'TZI.HLD.DEP.GNOSIS'
            }

            # Test documentation endpoint
            response = requests.get(
                f'{api_url}/api/v1/documentation?topic=test',
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                self.log_test(
                    'Scribe Depot - Connection',
                    True,
                    'Successfully connected to Scribe Depot API',
                    f'Status: {response.status_code}'
                )
            elif response.status_code == 401:
                self.log_test(
                    'Scribe Depot - Authentication',
                    False,
                    'Authentication failed',
                    'Check API key and permissions'
                )
            else:
                self.log_test(
                    'Scribe Depot - Connection',
                    False,
                    f'Connection failed with status {response.status_code}',
                    response.text[:200]
                )

        except requests.exceptions.Timeout:
            self.log_test(
                'Scribe Depot - Connection',
                False,
                'Connection timeout',
                'Check network connectivity and API URL'
            )
        except requests.exceptions.ConnectionError:
            self.log_test(
                'Scribe Depot - Connection',
                False,
                'Connection error',
                'Check API URL and network connectivity'
            )
        except Exception as e:
            self.log_test(
                'Scribe Depot - Connection',
                False,
                f'Unexpected error: {str(e)}',
                None
            )

    def test_portfolio_api(self):
        """Test Portfolio API integration."""
        print("\n" + "="*60)
        print("Testing Portfolio API Integration")
        print("="*60)

        api_url = os.getenv('PORTFOLIO_API_URL')
        api_key = os.getenv('PORTFOLIO_API_KEY')

        if not api_url or api_key == 'your_portfolio_api_key':
            self.log_test(
                'Portfolio API - Credentials',
                False,
                'API credentials not configured',
                'Set PORTFOLIO_API_URL and PORTFOLIO_API_KEY in .env'
            )
            return

        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            response = requests.get(
                f'{api_url}/portfolio',
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                self.log_test(
                    'Portfolio API - Connection',
                    True,
                    'Successfully connected to Portfolio API',
                    f'Status: {response.status_code}'
                )
            elif response.status_code == 401:
                self.log_test(
                    'Portfolio API - Authentication',
                    False,
                    'Authentication failed',
                    'Check API key and permissions'
                )
            else:
                self.log_test(
                    'Portfolio API - Connection',
                    False,
                    f'Connection failed with status {response.status_code}',
                    response.text[:200]
                )

        except requests.exceptions.Timeout:
            self.log_test(
                'Portfolio API - Connection',
                False,
                'Connection timeout',
                'Check network connectivity and API URL'
            )
        except requests.exceptions.ConnectionError:
            self.log_test(
                'Portfolio API - Connection',
                False,
                'Connection error',
                'Check API URL and network connectivity'
            )
        except Exception as e:
            self.log_test(
                'Portfolio API - Connection',
                False,
                f'Unexpected error: {str(e)}',
                None
            )

    def test_trading_api(self):
        """Test Trading API integration."""
        print("\n" + "="*60)
        print("Testing Trading API Integration")
        print("="*60)

        api_url = os.getenv('TRADING_API_URL')
        api_key = os.getenv('TRADING_API_KEY')

        if not api_url or api_key == 'your_trading_api_key':
            self.log_test(
                'Trading API - Credentials',
                False,
                'API credentials not configured',
                'Set TRADING_API_URL and TRADING_API_KEY in .env'
            )
            return

        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            # Test account endpoint (read-only)
            response = requests.get(
                f'{api_url}/account',
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                self.log_test(
                    'Trading API - Connection',
                    True,
                    'Successfully connected to Trading API',
                    f'Status: {response.status_code}'
                )
            elif response.status_code == 401:
                self.log_test(
                    'Trading API - Authentication',
                    False,
                    'Authentication failed',
                    'Check API key and permissions'
                )
            else:
                self.log_test(
                    'Trading API - Connection',
                    False,
                    f'Connection failed with status {response.status_code}',
                    response.text[:200]
                )

        except requests.exceptions.Timeout:
            self.log_test(
                'Trading API - Connection',
                False,
                'Connection timeout',
                'Check network connectivity and API URL'
            )
        except requests.exceptions.ConnectionError:
            self.log_test(
                'Trading API - Connection',
                False,
                'Connection error',
                'Check API URL and network connectivity'
            )
        except Exception as e:
            self.log_test(
                'Trading API - Connection',
                False,
                f'Unexpected error: {str(e)}',
                None
            )

    def test_market_data_api(self):
        """Test Market Data API integration."""
        print("\n" + "="*60)
        print("Testing Market Data API Integration")
        print("="*60)

        api_url = os.getenv('MARKET_DATA_API_URL')
        api_key = os.getenv('MARKET_DATA_API_KEY')

        if not api_url or api_key == 'your_market_data_api_key':
            self.log_test(
                'Market Data API - Credentials',
                False,
                'API credentials not configured',
                'Set MARKET_DATA_API_URL and MARKET_DATA_API_KEY in .env'
            )
            return

        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            # Test quote endpoint
            response = requests.get(
                f'{api_url}/quote/AAPL',
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                self.log_test(
                    'Market Data API - Connection',
                    True,
                    'Successfully connected to Market Data API',
                    f'Status: {response.status_code}'
                )
            elif response.status_code == 401:
                self.log_test(
                    'Market Data API - Authentication',
                    False,
                    'Authentication failed',
                    'Check API key and permissions'
                )
            else:
                self.log_test(
                    'Market Data API - Connection',
                    False,
                    f'Connection failed with status {response.status_code}',
                    response.text[:200]
                )

        except requests.exceptions.Timeout:
            self.log_test(
                'Market Data API - Connection',
                False,
                'Connection timeout',
                'Check network connectivity and API URL'
            )
        except requests.exceptions.ConnectionError:
            self.log_test(
                'Market Data API - Connection',
                False,
                'Connection error',
                'Check API URL and network connectivity'
            )
        except Exception as e:
            self.log_test(
                'Market Data API - Connection',
                False,
                f'Unexpected error: {str(e)}',
                None
            )

    def generate_report(self):
        """Generate test report."""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.results['summary']['total']}")
        print(f"Passed: {self.results['summary']['passed']}")
        print(f"Failed: {self.results['summary']['failed']}")
        print(f"Skipped: {self.results['summary']['skipped']}")
        print(f"Success Rate: {(self.results['summary']['passed'] / self.results['summary']['total'] * 100) if self.results['summary']['total'] > 0 else 0:.1f}%")
        print("="*60)

        # Save results to file
        import json
        with open('results/integration_test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\nDetailed results saved to: results/integration_test_results.json")

        return self.results['summary']['failed'] == 0

def main():
    """Main execution function."""
    print("="*60)
    print("HOLDINGS DEPOT - API INTEGRATION TEST SUITE")
    print("="*60)
    print(f"Test Start Time: {datetime.now().isoformat()}")
    print("="*60)

    tester = IntegrationTester()

    # Test all integrations
    tester.test_consort_depot()
    tester.test_cashinghouse_depot()
    tester.test_scribe_depot()
    tester.test_portfolio_api()
    tester.test_trading_api()
    tester.test_market_data_api()

    # Generate report
    success = tester.generate_report()

    print(f"\nTest End Time: {datetime.now().isoformat()}")

    if success:
        print("\n✓ All integration tests passed!")
        return 0
    else:
        print("\n✗ Some integration tests failed. Please review the results.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
