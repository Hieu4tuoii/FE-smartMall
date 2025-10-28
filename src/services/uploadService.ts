import { API_CONFIG } from "@/configs/apiConfig";
import { AuthService } from "./authService";



export const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      // Lấy token từ AuthService
      const token = AuthService.getToken();
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload/images`, {
        method: 'POST',
        headers,
        body: formData,
      });
  
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      
      // Kiểm tra nếu status là 200 hoặc message chứa "successful"
      if (result.status !== 200 && !result.message?.toLowerCase().includes('successful')) {
        throw new Error(result.message || 'Upload failed');
      }
  
      if (!result.data) {
        throw new Error('No image URL returned');
      }
  
      return result.data;
    } catch (error) {
      throw error;
    }
  };

export const getImageUrl = (imagePath: string): string => {
  // Nếu đã là full URL thì trả về luôn
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Nếu là relative path thì ghép với base URL
  const fullUrl = `${API_CONFIG.BASE_URL}${imagePath}`;
  return fullUrl;
};
