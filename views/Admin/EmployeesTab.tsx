
import React, { useState, useMemo } from 'react';
import { Button, Input, Card } from '../../components/UI';
import { Employee } from '../../types';

export const EmployeesTab: React.FC<{ state: any }> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<Employee>>({
    name: '',
    whatsapp: '',
    birthDate: '',
    cpf: '',
    password: '',
    role: '',
    photo: ''
  });

  const handleSave = () => {
    if (!form.name || !form.role) {
      alert("Nome e Cargo são obrigatórios!");
      return;
    }

    if (editingId) {
      state.setEmployees(state.employees.map((e: Employee) => 
        e.id === editingId ? { ...e, ...form } : e
      ));
      alert("Funcionário atualizado!");
    } else {
      const newEmployee: Employee = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
      } as Employee;
      state.setEmployees([...state.employees, newEmployee]);
      alert("Funcionário cadastrado!");
    }

    setEditingId(null);
    setForm({ name: '', whatsapp: '', birthDate: '', cpf: '', password: '', role: '', photo: '' });
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({ ...employee });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este funcionário?")) {
      state.setEmployees(state.employees.filter((e: Employee) => e.id !== id));
    }
  };

  const filteredEmployees = useMemo(() => {
    return state.employees.filter((e: Employee) => 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [state.employees, search]);

  return (
    <div className="space-y-6">
       {/* Formulário de Cadastro/Edição */}
       <Card className="p-6">
          <h3 className="text-sm font-black italic uppercase text-gray-800 mb-4">
            {editingId ? 'Editar Funcionário' : 'Cadastro de Funcionários'}
          </h3>
          <div className="space-y-4">
             <div className="grid grid-cols-3 gap-4">
                <div className="w-full aspect-square bg-gray-50 rounded-3xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {form.photo ? (
                    <img src={form.photo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold text-center p-2 uppercase italic">Foto</span>
                  )}
                </div>
                <div className="col-span-2 space-y-4">
                  <Input label="NOME *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  <Input label="WHATSAPP *" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
                </div>
             </div>
             <Input label="NASCIMENTO" type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
               <Input label="CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
               <Input label="SENHA" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4 items-end">
               <Input label="CARGO" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
               <div className="flex gap-2">
                 {editingId && (
                   <Button variant="ghost" onClick={() => { setEditingId(null); setForm({name:'', whatsapp:'', birthDate:'', cpf:'', password:'', role:'', photo:''}); }} className="w-full text-[10px]">CANCELAR</Button>
                 )}
                 <Button variant="secondary" onClick={handleSave} className="w-full uppercase italic font-black">
                   {editingId ? 'ATUALIZAR' : 'SALVAR'}
                 </Button>
               </div>
             </div>
          </div>
       </Card>

       {/* Busca */}
       <div className="relative group px-1">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="BUSCAR FUNCIONÁRIO POR NOME OU CARGO..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-white rounded-[20px] shadow-sm outline-none focus:ring-2 focus:ring-secondary transition-all text-slate-700 font-black italic uppercase text-[10px] border border-slate-100"
        />
      </div>

       {/* Lista de Funcionários */}
       <div className="bg-white rounded-[35px] shadow-sm border border-gray-100 overflow-hidden p-4 space-y-3">
          <h4 className="text-[10px] font-black italic text-gray-300 uppercase mb-2 tracking-[0.2em] px-2">Lista de Funcionários</h4>
          
          <div className="space-y-2">
            {filteredEmployees.length === 0 ? (
              <div className="py-10 text-center opacity-20">
                <p className="text-[10px] font-black uppercase italic">Nenhum funcionário encontrado</p>
              </div>
            ) : (
              filteredEmployees.map((emp: Employee) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                    {emp.photo ? (
                      <img src={emp.photo} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[10px] font-black text-slate-700 uppercase italic truncate">{emp.name}</h5>
                    <p className="text-[8px] font-bold text-secondary uppercase italic">{emp.role}</p>
                    <p className="text-[7px] text-slate-400 font-bold">📱 {emp.whatsapp}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(emp)} className="p-2 bg-blue-100 text-blue-600 rounded-lg active:scale-90 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-2 bg-red-100 text-red-600 rounded-lg active:scale-90 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
       </div>
    </div>
  );
};
