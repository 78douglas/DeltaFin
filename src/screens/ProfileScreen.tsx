import { useState } from 'react';
import { 
  User, 
  HelpCircle, 
  LogOut,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Grid3X3
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '../components/ui';
import CategoriesManagementScreen from './CategoriesManagementScreen';

const ProfileScreen = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoriesManagement, setShowCategoriesManagement] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-15',
    location: 'São Paulo, SP'
  });
  const [editForm, setEditForm] = useState(userInfo);

  const handleSaveProfile = () => {
    setUserInfo(editForm);
    setShowEditModal(false);
  };

  const menuItems = [
    {
      icon: Grid3X3,
      title: 'Gerenciar Categorias',
      description: 'Organize suas categorias de transações',
      action: () => setShowCategoriesManagement(true)
    },
    {
      icon: HelpCircle,
      title: 'Ajuda e Suporte',
      description: 'Central de ajuda e contato',
      action: () => console.log('Ajuda')
    }
  ];

  // Se estiver na tela de gerenciamento de categorias, renderizar ela
  if (showCategoriesManagement) {
    return (
      <CategoriesManagementScreen 
        onBack={() => setShowCategoriesManagement(false)} 
      />
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-white" />
            </div>
            
            {/* Nome e Email */}
            <h2 className="text-xl font-bold text-gray-800 mb-1">{userInfo.name}</h2>
            <p className="text-gray-600 mb-4">{userInfo.email}</p>
            
            {/* Botão Editar */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditForm(userInfo);
                setShowEditModal(true);
              }}
              className="flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Editar Perfil</span>
            </Button>
          </div>

          {/* Informações Detalhadas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{userInfo.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">
                  {new Date(userInfo.birthDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium">{userInfo.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu de Opções */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Botão Sair */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => console.log('Logout')}
          >
            <LogOut size={20} />
            <span>Sair da Conta</span>
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="md"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold">Editar Perfil</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nome Completo"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite seu nome completo"
            />

            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Digite seu email"
            />

            <Input
              label="Telefone"
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Digite seu telefone"
            />

            <Input
              label="Data de Nascimento"
              type="date"
              value={editForm.birthDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
            />

            <Input
              label="Localização"
              value={editForm.location}
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Digite sua cidade/estado"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowEditModal(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSaveProfile}>
            Salvar Alterações
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProfileScreen