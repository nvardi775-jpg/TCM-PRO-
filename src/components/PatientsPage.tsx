import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button, Input } from './ui';
import { supabase } from '../services/supabaseClient';
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Calendar, 
  FileText,
  Trash2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('patients')
        .insert([{
          name: newPatient.name,
          age: parseInt(newPatient.age),
          gender: newPatient.gender,
          notes: newPatient.notes,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      setShowAddModal(false);
      setNewPatient({ name: '', age: '', gender: 'Male', notes: '' });
      fetchPatients();
    } catch (err) {
      console.error('Error adding patient:', err);
    }
  };

  const deletePatient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1F1F1F]">Patients</h1>
            <p className="text-gray-500">Manage your clinical patient records.</p>
          </div>
        </div>
        <Button 
          className="rounded-2xl h-14 px-8 text-lg font-semibold flex gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={20} /> Add New Patient
        </Button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          placeholder="Search patients by name..." 
          className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* PATIENT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all group">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center text-xl font-bold">
                      {patient.name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.age} Years · {patient.gender}</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                    <Calendar size={16} className="text-[#6C5CE7]" />
                    <span>Registered: {new Date(patient.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                    <FileText size={16} className="text-[#6C5CE7]" />
                    <span>Last Diagnosis: {patient.last_diagnosis || 'None'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-xl gap-2 text-xs">
                    View Records <ChevronRight size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => deletePatient(patient.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No patients found</h3>
            <p className="text-gray-400 text-sm">Start by adding your first patient record.</p>
          </div>
        )}
      </div>

      {/* ADD PATIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
          <Card className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-none">
            <div className="bg-[#6C5CE7] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Add New Patient</h2>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/10 p-1 rounded-lg">
                <MoreVertical size={24} />
              </button>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <Input 
                    placeholder="Enter patient's full name" 
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Age</label>
                    <Input 
                      type="number" 
                      placeholder="Age" 
                      required
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Gender</label>
                    <select 
                      className="w-full h-12 rounded-xl border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Clinical Notes</label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Initial observations, medical history, etc."
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 rounded-xl"
                  >
                    Save Patient
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
