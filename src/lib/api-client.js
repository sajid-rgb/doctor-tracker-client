import { API_BASE_URL } from '@/lib/constants';
import { getTokenCookie } from '@/lib/auth-cookie';

export const apiFetch= async (endpoint, options = {})=>{
  const baseUrl = (API_BASE_URL || 'https://doctor-tracker-server-self.vercel.app').replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const token = await getTokenCookie();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export const  getPatientsByDoctor = async (doctorId)=>{
  return apiFetch(`/api/patients/getPatientsByDoctor/${doctorId}`);
}

export const getPatients = async (query = '')=>{
  let queryString = '';
  if (typeof query === 'string') {
    queryString = query;
  } else if (query && typeof query === 'object') {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        params.append(k, v);
      }
    });
    queryString = params.toString();
  }
  return apiFetch(`/api/patients${queryString ? `?${queryString}` : ''}`);
}

export const createPatient = async (patientData)=>{
  return apiFetch('/api/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
}

export const deletePatient = async (patientId)=>{
  return apiFetch(`/api/patients/${patientId}`, {
    method: 'DELETE',
  });
}

export const updatePatient = async (patientId, patientData)=>{
  return apiFetch(`/api/patients/${patientId}`, {
    method: 'PATCH',
    body: JSON.stringify(patientData),
  });
}

export const deletePatientFromDoctor = async (patientId)=>{
  return apiFetch(`/api/patients/deletePatientsFromDoctor/${patientId}`, {
    method: 'DELETE',
  });
}

export const getDoctors = async (query = '')=>{
  return apiFetch(`/api/doctors${query ? `?${query}` : ''}`);
}

export const getDoctorById = async (doctorId)=>{
  return apiFetch(`/api/doctors/${doctorId}`);
}
export const createDoctor = async (doctorData)=>{
  return apiFetch('/api/doctors', {
    method: 'POST',
    body: JSON.stringify(doctorData),
  });
}

export const updateDoctor = async (doctorId, doctorData)=>{
  const payload = {
    updateData: doctorData,
    ...doctorData,
  };
  return apiFetch(`/api/doctors/${doctorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export const deleteDoctor = async (doctorId)=>{
  return apiFetch(`/api/doctors/${doctorId}`, {
    method: 'DELETE',
  });
}

export const getSpecializations = async () =>{
  return apiFetch('/api/doctors/specializations');
}
export const getHospitals = async () =>{
  return apiFetch('/api/doctors/hospitals');
}

export const getDashboardStats = async () =>{
  return apiFetch('/api/dashboard/stats');
}

export const getPatientCondition = async () => {
  return apiFetch('/api/patients/getPatientCondition');
};

export const getPatientConditions = getPatientCondition;

