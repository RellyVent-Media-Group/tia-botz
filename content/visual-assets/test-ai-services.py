#!/usr/bin/env python3
"""
AI Services Testing and Validation Script
Tests DALL-E, Stable Diffusion, and Midjourney connectivity and functionality
"""

import json
import os
import requests
import base64
import time
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class TestResult(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    SKIP = "SKIP"
    WARN = "WARN"

@dataclass
class ServiceTest:
    service_name: str
    test_name: str
    result: TestResult
    duration: float
    message: str
    details: Optional[dict] = None

class AIServiceTester:
    def __init__(self, config_file="config.json"):
        self.config_file = config_file
        self.config = self.load_config()
        self.test_results: List[ServiceTest] = []
        
    def load_config(self) -> dict:
        """Load configuration from JSON file."""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Config file '{self.config_file}' not found.")
            return {}
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON in '{self.config_file}'.")
            return {}
    
    def add_test_result(self, service_name: str, test_name: str, result: TestResult, 
                       duration: float, message: str, details: Optional[dict] = None):
        """Add a test result to the results list."""
        test = ServiceTest(service_name, test_name, result, duration, message, details)
        self.test_results.append(test)
    
    def print_test_result(self, test: ServiceTest):
        """Print a formatted test result."""
        symbols = {
            TestResult.PASS: "✓",
            TestResult.FAIL: "✗",
            TestResult.SKIP: "○",
            TestResult.WARN: "⚠"
        }
        
        symbol = symbols[test.result]
        print(f"{symbol} [{test.service_name}] {test.test_name}: {test.message} ({test.duration:.2f}s)")
        
        if test.details:
            for key, value in test.details.items():
                print(f"    {key}: {value}")
    
    def test_dalle_service(self) -> bool:
        """Test DALL-E service comprehensively."""
        print("\n" + "="*60)
        print("Testing DALL-E Service")
        print("="*60)
        
        config = self.config.get("ai_services", {}).get("dalle", {})
        if not config.get("enabled", True):
            self.add_test_result("DALL-E", "Service Enabled", TestResult.SKIP, 0, "Service disabled in config")
            return False
        
        # Test 1: API Key Check
        start_time = time.time()
        api_key = os.environ.get(config.get("api_key_env", "OPENAI_API_KEY"))
        duration = time.time() - start_time
        
        if not api_key:
            self.add_test_result("DALL-E", "API Key Check", TestResult.FAIL, duration, 
                               f"API key not found in {config.get('api_key_env', 'OPENAI_API_KEY')}")
            return False
        else:
            self.add_test_result("DALL-E", "API Key Check", TestResult.PASS, duration, "API key found")
        
        # Test 2: Package Installation
        start_time = time.time()
        try:
            from openai import OpenAI
            duration = time.time() - start_time
            self.add_test_result("DALL-E", "Package Installation", TestResult.PASS, duration, "OpenAI package installed")
        except ImportError:
            duration = time.time() - start_time
            self.add_test_result("DALL-E", "Package Installation", TestResult.FAIL, duration, 
                               "OpenAI package not installed. Run: pip install openai")
            return False
        
        # Test 3: API Connectivity
        start_time = time.time()
        try:
            client = OpenAI()
            response = client.models.list()
            duration = time.time() - start_time
            self.add_test_result("DALL-E", "API Connectivity", TestResult.PASS, duration, 
                               "API connection successful")
        except Exception as e:
            duration = time.time() - start_time
            self.add_test_result("DALL-E", "API Connectivity", TestResult.FAIL, duration, str(e))
            return False
        
        # Test 4: Image Generation Test
        start_time = time.time()
        try:
            test_prompt = "A simple test image: a red circle on white background"
            response = client.images.generate(
                model=config.get("model", "dall-e-3"),
                prompt=test_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            duration = time.time() - start_time
            image_url = response.data[0].url
            
            self.add_test_result("DALL-E", "Image Generation", TestResult.PASS, duration, 
                               "Test image generated successfully", {"image_url": image_url})
            
            # Test 5: Image Download
            start_time = time.time()
            try:
                img_response = requests.get(image_url, timeout=30)
                duration = time.time() - start_time
                
                if img_response.status_code == 200:
                    self.add_test_result("DALL-E", "Image Download", TestResult.PASS, duration, 
                                       "Image downloaded successfully")
                else:
                    self.add_test_result("DALL-E", "Image Download", TestResult.FAIL, duration, 
                                       f"HTTP {img_response.status_code}")
            except Exception as e:
                duration = time.time() - start_time
                self.add_test_result("DALL-E", "Image Download", TestResult.FAIL, duration, str(e))
                
        except Exception as e:
            duration = time.time() - start_time
            self.add_test_result("DALL-E", "Image Generation", TestResult.FAIL, duration, str(e))
            return False
        
        return True
    
    def test_stable_diffusion_service(self) -> bool:
        """Test Stable Diffusion service comprehensively."""
        print("\n" + "="*60)
        print("Testing Stable Diffusion Service")
        print("="*60)
        
        config = self.config.get("ai_services", {}).get("stable_diffusion", {})
        if not config.get("enabled", True):
            self.add_test_result("Stable Diffusion", "Service Enabled", TestResult.SKIP, 0, "Service disabled in config")
            return False
        
        api_url = config.get("api_url", "http://127.0.0.1:7860/sdapi/v1/txt2img")
        
        # Test 1: API Connectivity
        start_time = time.time()
        try:
            # Test the health endpoint
            health_url = api_url.replace("/txt2img", "/sdapi/v1/sd-models")
            response = requests.get(health_url, timeout=5)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                models = response.json()
                self.add_test_result("Stable Diffusion", "API Connectivity", TestResult.PASS, duration, 
                                   "API connection successful", {"models": len(models)})
            else:
                self.add_test_result("Stable Diffusion", "API Connectivity", TestResult.FAIL, duration, 
                                   f"HTTP {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            duration = time.time() - start_time
            self.add_test_result("Stable Diffusion", "API Connectivity", TestResult.FAIL, duration, 
                               "Connection refused. Is Stable Diffusion WebUI running?")
            return False
        except Exception as e:
            duration = time.time() - start_time
            self.add_test_result("Stable Diffusion", "API Connectivity", TestResult.FAIL, duration, str(e))
            return False
        
        # Test 2: Image Generation Test
        start_time = time.time()
        try:
            test_prompt = "A simple test image: a red circle on white background"
            payload = {
                "prompt": test_prompt,
                "width": 512,
                "height": 512,
                "steps": 10,  # Faster for testing
                "cfg_scale": 7,
                "sampler_name": config.get("default_sampler", "Euler a")
            }
            
            response = requests.post(api_url, json=payload, timeout=60)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                self.add_test_result("Stable Diffusion", "Image Generation", TestResult.PASS, duration, 
                                   "Test image generated successfully")
            else:
                self.add_test_result("Stable Diffusion", "Image Generation", TestResult.FAIL, duration, 
                                   f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.add_test_result("Stable Diffusion", "Image Generation", TestResult.FAIL, duration, str(e))
            return False
        
        # Test 3: Image Decoding
        start_time = time.time()
        try:
            if response.status_code == 200:
                result = response.json()
                image_data = base64.b64decode(result["images"][0])
                duration = time.time() - start_time
                
                if len(image_data) > 0:
                    self.add_test_result("Stable Diffusion", "Image Decoding", TestResult.PASS, duration, 
                                       f"Image decoded successfully ({len(image_data)} bytes)")
                else:
                    self.add_test_result("Stable Diffusion", "Image Decoding", TestResult.FAIL, duration, 
                                       "Empty image data")
            else:
                duration = time.time() - start_time
                self.add_test_result("Stable Diffusion", "Image Decoding", TestResult.SKIP, duration, 
                                   "Skipped due to generation failure")
                
        except Exception as e:
            duration = time.time() - start_time
            self.add_test_result("Stable Diffusion", "Image Decoding", TestResult.FAIL, duration, str(e))
        
        return True
    
    def test_midjourney_service(self) -> bool:
        """Test Midjourney service comprehensively."""
        print("\n" + "="*60)
        print("Testing Midjourney Service")
        print("="*60)
        
        config = self.config.get("ai_services", {}).get("midjourney", {})
        if not config.get("enabled", True):
            self.add_test_result("Midjourney", "Service Enabled", TestResult.SKIP, 0, "Service disabled in config")
            return False
        
        api_url = config.get("api_url", "https://api.midjourney.com/v2")
        
        # Test 1: API Connectivity
        start_time = time.time()
        try:
            response = requests.get(api_url, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code in [200, 401, 403]:  # API is responding
                self.add_test_result("Midjourney", "API Connectivity", TestResult.PASS, duration, 
                                   "API endpoint reachable")
            else:
                self.add_test_result("Midjourney", "API Connectivity", TestResult.WARN, duration, 
                                   f"Unexpected HTTP {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            duration = time.time() - start_time
            self.add_test_result("Midjourney", "API Connectivity", TestResult.WARN, duration, 
                               f"API connectivity issue: {str(e)[:50]}")
        
        # Test 2: Configuration Check
        start_time = time.time()
        bot_token = config.get("discord_bot_token", "")
        channel_id = config.get("discord_channel_id", "")
        duration = time.time() - start_time
        
        if bot_token and channel_id:
            self.add_test_result("Midjourney", "Configuration", TestResult.PASS, duration, 
                               "Discord bot token and channel ID configured")
        else:
            self.add_test_result("Midjourney", "Configuration", TestResult.WARN, duration, 
                               "Discord bot token or channel ID missing")
        
        # Test 3: API Requirements
        start_time = time.time()
        duration = time.time() - start_time
        self.add_test_result("Midjourney", "API Requirements", TestResult.WARN, duration, 
                           "Midjourney requires Discord bot setup - manual configuration needed")
        
        return True  # Midjourney tests are warnings, not hard failures
    
    def test_all_services(self):
        """Test all AI services."""
        print("AI Services Testing and Validation")
        print("="*60)
        print(f"Config file: {self.config_file}")
        print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test each service
        self.test_dalle_service()
        self.test_stable_diffusion_service()
        self.test_midjourney_service()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*60)
        print("Test Summary")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed = sum(1 for t in self.test_results if t.result == TestResult.PASS)
        failed = sum(1 for t in self.test_results if t.result == TestResult.FAIL)
        skipped = sum(1 for t in self.test_results if t.result == TestResult.SKIP)
        warnings = sum(1 for t in self.test_results if t.result == TestResult.WARN)
        
        print(f"Total Tests: {total_tests}")
        print(f"✓ Passed: {passed}")
        print(f"✗ Failed: {failed}")
        print(f"○ Skipped: {skipped}")
        print(f"⚠ Warnings: {warnings}")
        
        # Service availability summary
        print("\nService Availability:")
        service_status = {}
        for test in self.test_results:
            if test.service_name not in service_status:
                service_status[test.service_name] = TestResult.PASS
            
            if test.result == TestResult.FAIL:
                service_status[test.service_name] = TestResult.FAIL
            elif test.result == TestResult.WARN and service_status[test.service_name] == TestResult.PASS:
                service_status[test.service_name] = TestResult.WARN
        
        for service, status in service_status.items():
            symbols = {TestResult.PASS: "✓", TestResult.FAIL: "✗", TestResult.WARN: "⚠", TestResult.SKIP: "○"}
            symbol = symbols[status]
            status_text = status.value
            print(f"{symbol} {service}: {status_text}")
        
        # Recommendations
        print("\nRecommendations:")
        if failed > 0:
            print("• Fix failed tests before using generation script")
        if warnings > 0:
            print("• Review warnings - may affect functionality")
        if passed == total_tests:
            print("• All services ready for generation!")
        
        # Print detailed results
        print("\nDetailed Results:")
        for test in self.test_results:
            self.print_test_result(test)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Test AI services connectivity and functionality"
    )
    parser.add_argument(
        "--config-file",
        default="config.json",
        help="Path to config file (default: config.json)"
    )
    
    args = parser.parse_args()
    
    # Change to the script's directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    tester = AIServiceTester(config_file=args.config_file)
    tester.test_all_services()

if __name__ == "__main__":
    main()