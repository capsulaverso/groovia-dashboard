import { google } from 'googleapis';
import { Readable } from 'stream';

// Configuração do Google Drive
export interface DriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export class GoogleDriveService {
  private auth: any;
  private drive: any;

  constructor(config: DriveConfig) {
    // Criar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: config.refreshToken
    });

    this.auth = oauth2Client;
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  // Listar arquivos de um usuário
  async listUserFiles(userEmail: string, limit = 10) {
    try {
      const response = await this.drive.files.list({
        q: `'${userEmail}' in owners`,
        pageSize: limit,
        fields: 'files(id, name, mimeType, createdTime, size)',
        orderBy: 'createdTime desc'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw new Error('Erro ao listar arquivos do Google Drive');
    }
  }

  // Upload de arquivo
  async uploadFile(file: Buffer, fileName: string, mimeType: string, userEmail: string) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [] // Pasta raiz do Drive
      };

      const media = {
        mimeType,
        body: new Readable({
          read() {
            this.push(file);
            this.push(null);
          }
        })
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size'
      });

      // Compartilhar com o usuário se necessário
      // await this.shareFile(response.data.id, userEmail);

      return {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        size: response.data.size,
        url: `https://drive.google.com/file/d/${response.data.id}/view`
      };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error('Erro ao fazer upload para o Google Drive');
    }
  }

  // Baixar arquivo por ID
  async downloadFile(fileId: string) {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw new Error('Erro ao baixar arquivo do Google Drive');
    }
  }

  // Deletar arquivo
  async deleteFile(fileId: string) {
    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new Error('Erro ao deletar arquivo do Google Drive');
    }
  }

  // Buscar arquivo por nome
  async searchFiles(query: string, userEmail: string) {
    try {
      const response = await this.drive.files.list({
        q: `name contains '${query}' and '${userEmail}' in owners`,
        fields: 'files(id, name, mimeType, createdTime)'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      throw new Error('Erro ao buscar arquivos no Google Drive');
    }
  }
}

// Factory para criar serviço se tiver credenciais
export function createDriveService(): GoogleDriveService | null {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    console.log('⚠️  Google Drive não configurado - usando armazenamento local');
    return null;
  }

  return new GoogleDriveService({
    clientId,
    clientSecret,
    redirectUri,
    refreshToken
  });
}

