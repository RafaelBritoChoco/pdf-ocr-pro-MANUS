import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import type { ProcessingSettings } from '@/lib/api';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const updateSettings = (key: keyof ProcessingSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const updateOutputFormat = (format: keyof ProcessingSettings['outputFormats'], checked: boolean) => {
    onSettingsChange({
      ...settings,
      outputFormats: {
        ...settings.outputFormats,
        [format]: checked
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-neutral mb-4">Processing Settings</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Extraction Method
          </Label>
          <Select 
            value={settings.extractionMethod} 
            onValueChange={(value: 'quick' | 'ai-correction' | 'ai-ocr') => 
              updateSettings('extractionMethod', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">Quick Text</SelectItem>
              <SelectItem value="ai-correction">AI Correction</SelectItem>
              <SelectItem value="ai-ocr">AI OCR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            AI Enhancement Level
          </Label>
          <Select 
            value={settings.aiLevel}
            onValueChange={(value: 'basic' | 'standard' | 'advanced') => 
              updateSettings('aiLevel', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic Formatting</SelectItem>
              <SelectItem value="standard">Standard Enhancement</SelectItem>
              <SelectItem value="advanced">Advanced Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Output Format
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="output-text"
                checked={settings.outputFormats.text}
                onCheckedChange={(checked) => updateOutputFormat('text', checked as boolean)}
              />
              <Label htmlFor="output-text" className="text-sm text-gray-700">
                Plain Text (.txt)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="output-word"
                checked={settings.outputFormats.word}
                onCheckedChange={(checked) => updateOutputFormat('word', checked as boolean)}
              />
              <Label htmlFor="output-word" className="text-sm text-gray-700">
                Word Document (.docx)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="output-markdown"
                checked={settings.outputFormats.markdown}
                onCheckedChange={(checked) => updateOutputFormat('markdown', checked as boolean)}
              />
              <Label htmlFor="output-markdown" className="text-sm text-gray-700">
                Markdown (.md)
              </Label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="debug-mode" className="text-sm font-medium text-gray-700">
              Debug Mode
            </Label>
            <Switch
              id="debug-mode"
              checked={settings.debugMode}
              onCheckedChange={(checked) => updateSettings('debugMode', checked)}
            />
          </div>
          <p className="text-xs text-gray-500">Enable detailed processing logs</p>
        </div>
      </div>
    </div>
  );
}
