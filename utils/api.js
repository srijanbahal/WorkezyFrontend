 import axios from "axios";

// Use the AWS server endpoint
// const API_BASE_URL = "https://api.workezy.org/api"; 
// Local development server - comment out when using the AWS endpoint
// const API_BASE_URL = "http://192.168.2.68:5000/api";
// const API_BASE_URL = "http://172.16.48.26:5000/api"; 
// const API_BASE_URL = "http://127.0.0.1:5000/api"; 
// const API_BASE_URL = "http://10.31.128.157:5000/api";
const API_BASE_URL = "https://goldfish-app-fj43o.ondigitalocean.app/api"; 



// Create axios instance with enhanced error handling
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: 'application/json',
    },
    // Add reasonable timeouts to prevent app hanging
    timeout: 15000
});

// Add interceptor to handle network errors more gracefully
api.interceptors.response.use(
  response => response,
  error => {
    // Enhance error messages for better debugging
    if (error.code === 'ECONNABORTED') {
      console.error('API request timeout:', error.config.url);
      error.message = 'Request timed out. Please check your internet connection.';
    } else if (!error.response) {
      console.error('Network error:', error.config?.url || 'unknown endpoint');
      error.message = 'Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

// Add a specific direct employer profile endpoint
export const getEmployerProfile = (employerId) => api.get(`/employers/profile/${employerId}`);

// API Endpoints
export const requestOTP = (mobile) => api.post("/auth/request-otp", {mobile});
export const verifyOTP = (data) => api.post("/auth/verify-otp", data);
export const registerUser = (data) => api.post("/users/register", data);
export const updateProfile = (data) => api.put("/users/update-profile", data);
export const updateEmployerProfile = (data) => api.put("/employers/update-profile", data);
export const getJobs = () => api.get("/users/jobs");
export const applyJob = (data) => api.post("/users/apply-job", data);
export const getMyJobs = (jobSeekerId) => api.get(`/users/my-jobs/${jobSeekerId}`);
export const GetResumeDetails = (jobSeekerId) => api.get(`/users/resume/${jobSeekerId}`);
export const postJob = (data) => api.post("/employers/post-job", data);
export const getApplicants = (jobId) => api.get(`/employers/job-applications/${jobId}`);
export const getCandidateDetails = (candidateId) => api.get(`/employers/candidate-details/${candidateId}`);
export const employerJobs=(employerId)=>api.get(`/employers/my-jobs/${employerId}`);
export const checkEducation = (userId) => api.get(`/users/check-education/${userId}`);
export const checkInterestStatus = (jobId, candidateId) => 
  api.get(`/employers/check-interest/${jobId}/${candidateId}`);

export const sendInterestToCandicate = (jobId, candidateId) => 
  api.post("/employers/send-interest", { jobId, candidateId });
export const getJobDetails = (jobId) => api.get(`/employers/job-details/${jobId}`);
export const updateJob = (jobId, data) => api.put(`/employers/update-job/${jobId}`, data);

export const ResumeData=(data)=>api.put("users/update-resume",data);

export const getJobQuestions = (jobId) => api.get(`users/job-questions/${jobId}`);

// Fixed API endpoint to match backend structure with fallback options
export const 
getProfileDetails = async (userId, userType) => {
  console.log(`Attempting to fetch profile for userId: ${userId}, userType: ${userType}`);
  
  // For employer profiles, directly use the dedicated endpoint
  if (userType === 'employer') {
    try {
      // Use the dedicated employer profile function 
      console.log(`Trying direct employer endpoint: /employers/profile/${userId}`);
      return await getEmployerProfile(userId);
    } catch (employerError) {
      console.log(`Direct employer endpoint failed with status: ${employerError.response?.status}`);
      // Continue to fallback methods if direct endpoint fails
    }
  }
  
  // Normalize userType to ensure it matches backend expectations
  const normalizedUserType = userType === 'employer' ? 'employers' : 'job_seeker';
  
  // Try multiple endpoint formats since different backend implementations may exist
  try {
    // First attempt: query parameters 
    console.log(`Trying endpoint: /users/get-user-detail`);
    return await api.get(`/users/get-user-detail`, {
      params: { userId, userType: normalizedUserType }  
    });
  } catch (error) {
    console.log(`First attempt failed with status: ${error.response?.status}`);
    
    if (error.response && error.response.status === 404) {
      try {
        // Second attempt: path parameters
        console.log(`Trying endpoint: /users/profile/${normalizedUserType}/${userId}`);
        return await api.get(`/users/profile/${normalizedUserType}/${userId}`);
      } catch (secondError) {
        console.log(`Second attempt failed with status: ${secondError.response?.status}`);
        
        if (secondError.response && secondError.response.status === 404) {
          try {
            // Third attempt: legacy endpoint format
            console.log(`Trying endpoint: /users/get-user-detail with params`);
            return await api.get(`/users/get-user-detail`, {
              params: { userId, userType: normalizedUserType }
            });
          } catch (thirdError) {
            console.log(`Third attempt failed with status: ${thirdError.response?.status}`);
            
            // Fourth attempt: Try direct URL format without params
            if (userType === 'employer') {
              try {
                console.log(`Trying employer direct endpoint with ID: /employer/${userId}`);
                return await api.get(`/employer/${userId}`);
              } catch (fourthError) {
                console.log(`Fourth attempt failed with status: ${fourthError.response?.status}`);
                throw fourthError;
              }
            }
            throw thirdError;
          }
        }
        throw secondError;
      }
    }
    throw error;
  }
};

    

    export const uploadImage = async (imageUri, userType, userId) => {
      try {
        const formData = new FormData();
    
        // Validate input
        if (!imageUri) throw new Error("Image URI is required");
        if (!userType) throw new Error("User type is required");
        if (!userId) throw new Error("User ID is required");
    
        // Extract file info
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const fileExtension = match ? match[1] : 'jpg';
        const fileType = `image/${fileExtension}`;
    
        // Create proper file object for React Native
        const file = {
          uri: imageUri,
          type: fileType,
          name: filename || `upload-${Date.now()}.${fileExtension}`,
        };
    
        // Append fields to FormData
        formData.append('userType', userType);
        formData.append('userId', userId);
        formData.append('file', file);
    
        console.log('Uploading image with data:', {
          userType,
          userId,
          filename: file.name,
          type: file.type,
          uri: imageUri
        });
    
        // Add timeout to axios
        const response = await api.post('/upload', formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        });
    
        console.log('Upload response:', response.data);
    
        if (!response.data.imageUrl) {
          throw new Error('Server did not return image URL');
        }
    
        return response.data.imageUrl;
      } catch (error) {
        let errorMessage = 'Upload failed';
        if (error.response) {
          // Server responded with error status
          console.error('Server error response:', error.response.data);
          errorMessage = error.response.data.message || error.response.statusText;
        } else if (error.request) {
          // No response received
          console.error('No response from server:', error.request);
          errorMessage = 'No response from server - check network connection';
        } else {
          console.error('Upload error:', error.message);
          errorMessage = error.message;
        }
        console.error('Full upload error:', error);
        throw new Error(errorMessage);
      }
    };
    
    // Upload Document API call
    export const uploadDocument = async (fileUri, employerId) => {
      try {
        const formData = new FormData();
    
        if (!fileUri) throw new Error("File URI is required");
        if (!employerId) throw new Error("Employer ID is required");
    
        const filename = fileUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const fileExtension = match ? match[1] : 'pdf';
        const fileType = `application/${fileExtension}`;
    
        // Create proper file object for React Native
        const file = {
          uri: fileUri,
          type: fileType,
          name: filename || `document-${Date.now()}.${fileExtension}`,
        };
    
        // Append fields to FormData
        formData.append("employerId", employerId);
        formData.append("document", file);
    
        console.log('Uploading document with data:', {
          employerId,
          filename: file.name,
          type: file.type,
          uri: fileUri
        });
    
        const response = await api.post("/upload-docs", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        });
    
        console.log('Document upload response:', response.data);
    
        if (!response.data.documentUrl) {
          throw new Error("Server did not return document URL");
        }
    
        return response.data.documentUrl;
      } catch (error) {
        let errorMessage = "Upload failed";
        if (error.response) {
          console.error('Server error response:', error.response.data);
          errorMessage = error.response.data.message || error.response.statusText;
        } else if (error.request) {
          console.error('No response from server:', error.request);
          errorMessage = "No response from server - check network connection";
        } else {
          console.error('Upload error:', error.message);
          errorMessage = error.message;
        }
        console.error("Full upload error:", error);
        throw new Error(errorMessage);
      }
    };

/**
 * Submit responses for job application questions
 * @param {Object} data - The question responses data
 * @param {number} data.applicationId - The ID of the job application
 * @param {Array} data.responses - Array of question responses
 * @param {number} data.responses[].questionId - The ID of the question
 * @param {string} data.responses[].answer - The answer to the question ('yes' or 'no')
 * @returns {Promise} - API response with success status and stats
 */
export const submitQuestionResponses = async (data) => {
  try {
    // Format the responses to match the backend schema exactly
    const formattedData = {
      applicationId: data.applicationId,
      responses: data.responses.map(response => ({
        questionId: response.questionId,
        answer: response.answer.toLowerCase() // Ensure lowercase for backend validation
      }))
    };

    const response = await api.post("/users/submit-question-responses", formattedData);
    return response;
  } catch (error) {
    console.error('Error submitting question responses:', error);
    throw error;
  }
};

export const checkMobileExists = async ({ mobile, userType }) => {
  return await api.post('/users/check-mobile-exists', { mobile, userType });
};

// Deactivate (soft delete) a user or employer profile
export const deactivateProfile = ({ userId, userType }) =>
  api.post('/users/delete-profile', { userId, userType });

// Fetch job question responses for a candidate for a specific job
export const getJobQuestionResponses = (jobId, jobSeekerId) =>
  api.get(`employers/job-question-responses/${jobId}/${jobSeekerId}`);