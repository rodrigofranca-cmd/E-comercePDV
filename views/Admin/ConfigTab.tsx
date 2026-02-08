
import React, { useState } from 'react';
import { Button, Input, Card } from '../../components/UI';

export const ConfigTab: React.FC<{ state: any; user: { name: string, role: string } }> = ({ state, user }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(state.config);
  
  const isChefe = user.role === 'CHEFE';

  const handleSave = () => {
    state.setConfig(formData);
    setEditing(false);
  };

  const handleColorChange = (key: keyof typeof formData.colors, value: string) => {
    setFormData({
      ...formData,
      colors: {
        ...formData.colors,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <Input label="NOME DA EMPRESA" value={formData.name} disabled={!editing} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="CNPJ" value={formData.cnpj} disabled={!editing} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} />
          <Input label="CHAVE PIX" value={formData.pixKey} disabled={!editing} onChange={e => setFormData({ ...formData, pixKey: e.target.value })} />
        </div>
        <Input label="ENDEREÇO" value={formData.address} disabled={!editing} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        <div className="flex gap-4 items-end">
          <Input label="FONE" value={formData.phone} disabled={!editing} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          <div className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex items-center justify-center p-2">
            {formData.logoUrl ? <img src={formData.logoUrl} className="max-h-full object-contain" /> : <span className="text-[8px] text-gray-400 text-center uppercase">Imagem da Logo</span>}
          </div>
        </div>
        <Input label="URL LOGOMARCA" value={formData.logoUrl} disabled={!editing} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
        
        <div className="flex justify-end">
          {editing ? (
            <Button onClick={handleSave} variant="secondary">Salvar Dados</Button>
          ) : (
            <Button 
              onClick={() => setEditing(true)} 
              variant="secondary" 
              disabled={!isChefe}
              title={!isChefe ? "Somente usuários com cargo 'CHEFE' podem editar dados" : ""}
            >
              Editar Dados
            </Button>
          )}
        </div>
        {!isChefe && <p className="text-[7px] text-red-400 font-black italic uppercase text-right">Restrito ao cargo: CHEFE</p>}
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-black italic uppercase text-gray-400">Paleta de Cores</h3>
        <div className="flex justify-between items-center gap-4">
          <label className="flex flex-col items-center gap-1 flex-1 cursor-pointer group">
             <div className="w-full h-12 rounded-xl border-2 border-gray-100 shadow-inner overflow-hidden relative transition-transform group-active:scale-95" style={{ backgroundColor: formData.colors.menus }}>
                <input 
                  type="color" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  value={formData.colors.menus}
                  onChange={(e) => handleColorChange('menus', e.target.value)}
                  disabled={!isChefe}
                />
             </div>
             <span className="text-[10px] font-black italic uppercase text-gray-500">MENUS</span>
          </label>
          
          <label className="flex flex-col items-center gap-1 flex-1 cursor-pointer group">
             <div className="w-full h-12 rounded-xl border-2 border-gray-100 shadow-inner overflow-hidden relative transition-transform group-active:scale-95" style={{ backgroundColor: formData.colors.buttons }}>
                <input 
                  type="color" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  value={formData.colors.buttons}
                  onChange={(e) => handleColorChange('buttons', e.target.value)}
                  disabled={!isChefe}
                />
             </div>
             <span className="text-[10px] font-black italic uppercase text-gray-500">BOTÕES</span>
          </label>
          
          <label className="flex flex-col items-center gap-1 flex-1 cursor-pointer group">
             <div className="w-full h-12 rounded-xl border-2 border-gray-100 shadow-inner overflow-hidden relative transition-transform group-active:scale-95" style={{ backgroundColor: formData.colors.promotions }}>
                <input 
                  type="color" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  value={formData.colors.promotions}
                  onChange={(e) => handleColorChange('promotions', e.target.value)}
                  disabled={!isChefe}
                />
             </div>
             <span className="text-[10px] font-black italic uppercase text-gray-500">PROMOÇÃO</span>
          </label>
        </div>
        
        <div className="flex justify-end flex-col items-end gap-2 pt-2">
          <Button 
            variant="secondary" 
            onClick={handleSave}
            disabled={!isChefe}
            className="w-full sm:w-auto"
          >
            Salvar Cores
          </Button>
          {!isChefe && <p className="text-[7px] text-red-400 font-black italic uppercase">Restrito ao cargo: CHEFE</p>}
        </div>
      </Card>
    </div>
  );
};
