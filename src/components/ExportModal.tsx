import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from './ui';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'pdf' | 'xls') => void;
  isExporting: boolean;
}

const ExportModal = ({ isOpen, onClose, onExport, isExporting }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'xls'>('csv');

  if (!isOpen) return null;

  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Arquivo de planilha simples',
      icon: FileSpreadsheet,
      color: 'text-green-600'
    },
    {
      value: 'pdf' as const,
      label: 'PDF',
      description: 'Documento formatado',
      icon: FileText,
      color: 'text-red-600'
    },
    {
      value: 'xls' as const,
      label: 'Excel',
      description: 'Planilha do Excel',
      icon: FileSpreadsheet,
      color: 'text-blue-600'
    }
  ];

  const handleExport = () => {
    onExport(selectedFormat);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download size={20} />
              Exportar Transações
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isExporting}
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">
              Escolha o formato de exportação:
            </label>
            <div className="space-y-2">
              {formatOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={option.value}
                      checked={selectedFormat === option.value}
                      onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'pdf' | 'xls')}
                      className="sr-only"
                    />
                    <IconComponent size={20} className={`mr-3 ${option.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportModal;