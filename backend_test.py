#!/usr/bin/env python3
"""
Comprehensive backend API tests for UnivLoop
Tests all endpoints with proper authentication and data validation
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://campus-circle-2.preview.emergentagent.com/api"
TEST_USER = {
    "name": "Marie Dubois",
    "email": "marie.dubois@univloop.com", 
    "password": "SecurePass123!",
    "department": "Informatique",
    "faculty": "Sciences",
    "year_of_study": "L3"
}

class UnivLoopAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_id = None
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, auth_required: bool = False) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        
        # Prepare headers
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        
        # Add authentication if required and available
        if auth_required and self.token:
            req_headers["Authorization"] = f"Bearer {self.token}"
        
        # Make request
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=req_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=req_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise
    
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.make_request("GET", "/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    self.log_result("Health Check", True, "API is running correctly")
                else:
                    self.log_result("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
    
    def test_user_registration(self):
        """Test user registration"""
        try:
            response = self.make_request("POST", "/auth/register", TEST_USER)
            
            if response.status_code == 201:
                data = response.json()
                if "access_token" in data:
                    self.token = data["access_token"]
                    self.log_result("User Registration", True, "User registered successfully")
                else:
                    self.log_result("User Registration", False, f"No token in response: {data}")
            elif response.status_code == 400:
                # User might already exist, try to login instead
                self.log_result("User Registration", True, "User already exists (expected)")
                self.test_user_login()
            else:
                self.log_result("User Registration", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
    
    def test_user_login(self):
        """Test user login"""
        try:
            login_data = {
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.token = data["access_token"]
                    self.log_result("User Login", True, "Login successful")
                else:
                    self.log_result("User Login", False, f"No token in response: {data}")
            else:
                self.log_result("User Login", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("User Login", False, f"Exception: {str(e)}")
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        try:
            response = self.make_request("GET", "/auth/me", auth_required=True)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data:
                    self.user_id = data["id"]
                    self.log_result("Get User Profile", True, f"Profile retrieved for {data['name']}")
                else:
                    self.log_result("Get User Profile", False, f"Invalid profile data: {data}")
            elif response.status_code == 401:
                self.log_result("Get User Profile", False, "Authentication failed - no valid token")
            else:
                self.log_result("Get User Profile", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get User Profile", False, f"Exception: {str(e)}")
    
    def test_auth_without_token(self):
        """Test that protected endpoints require authentication"""
        try:
            # Temporarily remove token
            old_token = self.token
            self.token = None
            
            response = self.make_request("GET", "/auth/me", auth_required=True)
            
            # Restore token
            self.token = old_token
            
            if response.status_code == 401:
                self.log_result("Auth Protection", True, "Protected endpoint correctly requires authentication")
            else:
                self.log_result("Auth Protection", False, 
                              f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Auth Protection", False, f"Exception: {str(e)}")
    
    def test_get_subjects(self):
        """Test getting all subjects"""
        try:
            response = self.make_request("GET", "/subjects")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 8:
                    # Store first subject for later use
                    if data:
                        self.test_data["subject_id"] = data[0]["id"]
                    self.log_result("Get Subjects", True, f"Retrieved {len(data)} subjects")
                else:
                    self.log_result("Get Subjects", False, 
                                  f"Expected at least 8 subjects, got {len(data) if isinstance(data, list) else 'invalid data'}")
            else:
                self.log_result("Get Subjects", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Subjects", False, f"Exception: {str(e)}")
    
    def test_create_resource(self):
        """Test creating a resource"""
        if not self.test_data.get("subject_id"):
            self.log_result("Create Resource", False, "No subject_id available")
            return
            
        try:
            resource_data = {
                "title": "Guide Complet Python",
                "description": "Un guide détaillé pour apprendre Python de A à Z",
                "subject_id": self.test_data["subject_id"],
                "type": "pdf",
                "file_url": "https://example.com/python-guide.pdf"
            }
            
            response = self.make_request("POST", "/resources", resource_data, auth_required=True)
            
            if response.status_code == 201:
                data = response.json()
                if "id" in data:
                    self.test_data["resource_id"] = data["id"]
                    self.log_result("Create Resource", True, f"Resource created: {data['title']}")
                else:
                    self.log_result("Create Resource", False, f"No ID in response: {data}")
            else:
                self.log_result("Create Resource", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Create Resource", False, f"Exception: {str(e)}")
    
    def test_get_resources(self):
        """Test getting all resources"""
        try:
            response = self.make_request("GET", "/resources")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Resources", True, f"Retrieved {len(data)} resources")
                else:
                    self.log_result("Get Resources", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Resources", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Resources", False, f"Exception: {str(e)}")
    
    def test_like_resource(self):
        """Test liking a resource"""
        if not self.test_data.get("resource_id"):
            self.log_result("Like Resource", False, "No resource_id available")
            return
            
        try:
            resource_id = self.test_data["resource_id"]
            response = self.make_request("POST", f"/resources/{resource_id}/like", auth_required=True)
            
            if response.status_code == 200:
                data = response.json()
                if "liked" in data and "likes" in data:
                    self.log_result("Like Resource", True, 
                                  f"Resource liked: {data['liked']}, total likes: {data['likes']}")
                else:
                    self.log_result("Like Resource", False, f"Invalid response format: {data}")
            else:
                self.log_result("Like Resource", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Like Resource", False, f"Exception: {str(e)}")
    
    def test_create_discussion(self):
        """Test creating a discussion"""
        try:
            discussion_data = {
                "title": "Question sur les algorithmes de tri",
                "content": "Quelle est la différence entre le tri rapide et le tri fusion en termes de complexité ?",
                "group_type": "global"
            }
            
            response = self.make_request("POST", "/discussions", discussion_data, auth_required=True)
            
            if response.status_code == 201:
                data = response.json()
                if "id" in data:
                    self.test_data["discussion_id"] = data["id"]
                    self.log_result("Create Discussion", True, f"Discussion created: {data['title']}")
                else:
                    self.log_result("Create Discussion", False, f"No ID in response: {data}")
            else:
                self.log_result("Create Discussion", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Create Discussion", False, f"Exception: {str(e)}")
    
    def test_get_discussions(self):
        """Test getting all discussions"""
        try:
            response = self.make_request("GET", "/discussions")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Discussions", True, f"Retrieved {len(data)} discussions")
                else:
                    self.log_result("Get Discussions", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Discussions", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Discussions", False, f"Exception: {str(e)}")
    
    def test_add_comment(self):
        """Test adding a comment to a discussion"""
        if not self.test_data.get("discussion_id"):
            self.log_result("Add Comment", False, "No discussion_id available")
            return
            
        try:
            comment_data = {
                "content": "Le tri rapide a une complexité moyenne de O(n log n) mais O(n²) dans le pire cas, tandis que le tri fusion est toujours O(n log n)."
            }
            
            discussion_id = self.test_data["discussion_id"]
            response = self.make_request("POST", f"/discussions/{discussion_id}/comments", 
                                       comment_data, auth_required=True)
            
            if response.status_code == 201:
                data = response.json()
                if "id" in data and "content" in data:
                    self.log_result("Add Comment", True, "Comment added successfully")
                else:
                    self.log_result("Add Comment", False, f"Invalid response format: {data}")
            else:
                self.log_result("Add Comment", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Add Comment", False, f"Exception: {str(e)}")
    
    def test_get_statistics(self):
        """Test getting platform statistics"""
        try:
            response = self.make_request("GET", "/statistics")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_users", "total_resources", "total_discussions", 
                                 "total_quizzes", "total_flashcards", "total_subjects"]
                
                if all(field in data for field in required_fields):
                    # Check if statistics are realistic (not all zeros)
                    total_count = sum(data[field] for field in required_fields)
                    if total_count > 0:
                        self.log_result("Get Statistics", True, 
                                      f"Statistics retrieved: {data['total_users']} users, "
                                      f"{data['total_resources']} resources, "
                                      f"{data['total_discussions']} discussions")
                    else:
                        self.log_result("Get Statistics", False, "All statistics are zero")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Get Statistics", False, f"Missing fields: {missing}")
            else:
                self.log_result("Get Statistics", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Statistics", False, f"Exception: {str(e)}")
    
    def test_get_notifications(self):
        """Test getting user notifications"""
        try:
            response = self.make_request("GET", "/notifications", auth_required=True)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Notifications", True, f"Retrieved {len(data)} notifications")
                else:
                    self.log_result("Get Notifications", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Get Notifications", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Get Notifications", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting UnivLoop API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        test_methods = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_user_profile,
            self.test_auth_without_token,
            self.test_get_subjects,
            self.test_create_resource,
            self.test_get_resources,
            self.test_like_resource,
            self.test_create_discussion,
            self.test_get_discussions,
            self.test_add_comment,
            self.test_get_statistics,
            self.test_get_notifications
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                test_name = test_method.__name__.replace("test_", "").replace("_", " ").title()
                self.log_result(test_name, False, f"Unexpected error: {str(e)}")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🎯 Success Rate: {(passed/total)*100:.1f}%")
        
        return passed == total


def main():
    """Main function to run tests"""
    tester = UnivLoopAPITester()
    
    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Fatal error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()