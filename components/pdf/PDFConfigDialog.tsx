"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ActivityPDF, { PDFSettings } from "./ActivityPDF";
import { ActivityData } from "@/store/useActivityStore";
import { Building2, User, Upload, FileDown, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityData;
}

export default function PDFConfigDialog({ isOpen, onClose, activity }: Props) {
  const [localSettings, setLocalSettings] = useState<PDFSettings>({
    template: "school",
    schoolName: "",
    teacherName: "",
    logo: null,
  });

  const [pdfSettings, setPdfSettings] = useState<PDFSettings>(localSettings);

  const [isUpdatingPDF, setIsUpdatingPDF] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsUpdatingPDF(true);
    const timer = setTimeout(() => {
      setPdfSettings(localSettings);
      setIsUpdatingPDF(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [localSettings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newLogo = reader.result as string;
        setLocalSettings((prev) => ({ ...prev, logo: newLogo }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Exportar para PDF
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Escolha o Modelo
            </Label>
            <RadioGroup
              value={localSettings.template}
              className="grid grid-cols-2 gap-4"
              onValueChange={(val) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  template: val as "school" | "tutor",
                }))
              }
            >
              <div>
                <RadioGroupItem
                  value="school"
                  id="school"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="school"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <Building2 className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Escola</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="tutor"
                  id="tutor"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="tutor"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <User className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">
                    Professor Particular
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="teacher">Nome do Professor</Label>
              <Input
                id="teacher"
                placeholder="Ex: Prof. Mateus"
                value={localSettings.teacherName}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    teacherName: e.target.value,
                  }))
                }
              />
            </div>

            {localSettings.template === "school" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="schoolName">Nome da Escola</Label>
                  <Input
                    id="schoolName"
                    placeholder="Ex: Escola Estadual..."
                    value={localSettings.schoolName}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        schoolName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo">Logo da Escola (Opcional)</Label>
                  <div className="flex items-center gap-3">
                    {localSettings.logo && (
                      <div className="h-10 w-10 relative rounded overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={localSettings.logo}
                          alt="Logo"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    <Label
                      htmlFor="logo-upload"
                      className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {localSettings.logo ? "Trocar Imagem" : "Carregar Imagem"}
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          {isClient &&
            (isUpdatingPDF ? (
              <Button
                disabled
                className="w-full sm:w-auto bg-primary/70 text-white"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando PDF...
              </Button>
            ) : (
              <PDFDownloadLink
                document={
                  <ActivityPDF activity={activity} settings={pdfSettings} />
                }
                fileName={`${activity.type}_${activity.title}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparando...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
