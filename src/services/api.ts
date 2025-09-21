import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/surgeries';

export interface Surgery {
  _id: string;
  date_time: string;
  surgery_type: string;
  surgeon_name: string;
  patient_name: string;
  patient_birthdate: string;
  patient_age: number;
}

export const getSurgeries = async (): Promise<Surgery[]> => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const createSurgery = async (newSurgery: Omit<Surgery, '_id' | 'patient_age'>): Promise<Surgery> => {
  const response = await axios.post(API_BASE_URL, newSurgery);
  return response.data;
};

export const updateSurgery = async (id: string, updatedSurgery: Partial<Surgery>): Promise<Surgery> => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, updatedSurgery);
  return response.data;
};

export const deleteSurgery = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
