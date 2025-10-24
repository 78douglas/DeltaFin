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
  Grid3X3,
  MessageCircle,
  FileText,
  ExternalLink,
  Settings
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
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import CategoriesManagementScreen from './CategoriesManagementScreen';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { state, setEditMode } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCategoriesManagement, setShowCategoriesManagement] = useState(false);
  
  // Dados do usuário com fallback para dados mockados se não houver dados do Google
  const [userInfo, setUserInfo] = useState({
    name: user?.user_metadata?.full_name || 'Usuário',
    email: user?.email || 'usuario@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-15',
    location: 'São Paulo, SP',
    avatar: user?.user_metadata?.avatar_url || null
  });
  
  const [editForm, setEditForm] = useState(userInfo);

  const handleSaveProfile = () => {
    setUserInfo(editForm);
    setShowEditModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    {
      icon: Grid3X3,
      title: 'Gerenciar Categorias',
      description: 'Organize suas categorias de transações',
      action: () => setShowCategoriesManagement(true)
    },
    {
      icon: Settings,
      title: 'Modo de Edição',
      description: 'Ativar edição e exclusão de transações',
      action: () => setEditMode(!state.editMode),
      isToggle: true,
      isActive: state.editMode
    },
    {
      icon: HelpCircle,
      title: 'Ajuda e Suporte',
      description: 'Central de ajuda e contato',
      action: () => setShowHelpModal(true)
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
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4 overflow-hidden">
              {userInfo.avatar ? (
                <img 
                  src={userInfo.avatar} 
                  alt="Avatar do usuário" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-white" />
              )}
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
                  {item.isToggle && (
                    <div className="flex items-center">
                      <div 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </div>
                  )}
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
            onClick={handleLogout}
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
              required
            />

            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Digite seu email"
              disabled
              helperText="Email não pode ser alterado (vinculado ao Google)"
            />

            <Input
              label="Telefone"
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
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

      {/* Modal de Ajuda e Suporte */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        size="lg"
      >
        <ModalHeader>
          <h2 className="text-xl font-bold">Ajuda e Suporte</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* FAQ Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                Perguntas Frequentes
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Como adicionar uma nova transação?</h4>
                  <p className="text-sm text-gray-600">
                    Clique no botão "+" no menu inferior e preencha os dados da transação. 
                    Você pode categorizar, adicionar descrição e definir se é receita ou despesa.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Como criar uma meta de economia?</h4>
                  <p className="text-sm text-gray-600">
                    Vá para a aba "Metas", clique em "Nova Meta" e defina o valor objetivo e prazo. 
                    Você pode fazer contribuições regulares para alcançar sua meta.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Como exportar meus dados?</h4>
                  <p className="text-sm text-gray-600">
                    Na tela de histórico, clique no botão "Exportar" para baixar seus dados 
                    em formato CSV ou PDF para análise externa.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Meus dados estão seguros?</h4>
                  <p className="text-sm text-gray-600">
                    Sim! Utilizamos criptografia de ponta a ponta e autenticação via Google. 
                    Seus dados financeiros são protegidos com os mais altos padrões de segurança.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MessageCircle size={20} className="mr-2 text-blue-600" />
                Entre em Contato
              </h3>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Email de Suporte</h4>
                      <p className="text-sm text-gray-600">78douglas@gmail.com</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('mailto:78douglas@gmail.com')}
                    >
                      <ExternalLink size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">WhatsApp</h4>
                      <p className="text-sm text-gray-600">(28) 999149589</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://wa.me/5528999149589')}
                    >
                      <ExternalLink size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Central de Ajuda Online</h4>
                      <p className="text-sm text-gray-600">Documentação completa e tutoriais</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://help.deltafin.com')}
                    >
                      <ExternalLink size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p>DeltaFin v1.0.0</p>
                <p>Desenvolvido com ❤️ para suas finanças</p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setShowHelpModal(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProfileScreen;