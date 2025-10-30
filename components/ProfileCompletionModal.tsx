import React, { useState } from 'react';
import { apiClient } from '../hooks/useApi';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId: number;
  clientId: number;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userId,
  clientId
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    commercialEmail: '',
    emailDomain: 'gmail.com',
    photoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  
  // Foto padrão
  const defaultPhoto = 'https://i.pravatar.cc/150?img=12';

  const handlePhotoSelect = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setFormData({ ...formData, photoUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Atualizar perfil do usuário
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const fullEmail = `${formData.commercialEmail}@${formData.emailDomain}`;

      await apiClient.put(`/users/${userId}?clientId=${clientId}`, {
        name: fullName,
        avatar: formData.photoUrl || defaultPhoto
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePhotos = [
    'https://i.pravatar.cc/150?img=12',
    'https://i.pravatar.cc/150?img=33',
    'https://i.pravatar.cc/150?img=47',
    'https://i.pravatar.cc/150?img=58',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <span className="material-icons-outlined">close</span>
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Finalizar seu cadastro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                placeholder="Nome"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
              <span className="material-icons-outlined absolute left-3 bottom-3 text-gray-400 text-lg">
                person
              </span>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sobrenome
              </label>
              <input
                type="text"
                placeholder="Sobrenome"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
              <span className="material-icons-outlined absolute left-3 bottom-3 text-gray-400 text-lg">
                badge
              </span>
            </div>
          </div>

          {/* Email Comercial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail comercial
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Seu e-mail"
                  value={formData.commercialEmail}
                  onChange={(e) => setFormData({ ...formData, commercialEmail: e.target.value })}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <span className="material-icons-outlined absolute left-3 bottom-3 text-gray-400 text-lg">
                  email
                </span>
              </div>
              <select
                value={formData.emailDomain}
                onChange={(e) => setFormData({ ...formData, emailDomain: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="gmail.com">gmail.com</option>
                <option value="outlook.com">outlook.com</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="empresa.com">empresa.com</option>
              </select>
            </div>
          </div>

          {/* Escolha sua foto */}
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Escolha sua foto
            </label>
            <div className="flex gap-2 flex-1">
              {availablePhotos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePhotoSelect(photo)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                    selectedPhoto === photo || (!selectedPhoto && index === 0)
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={photo} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              <span className="material-icons-outlined text-green-600 dark:text-green-400 text-sm">check_circle</span>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Full access</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : 'Add list'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;

