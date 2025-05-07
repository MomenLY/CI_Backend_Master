import { Injectable } from '@nestjs/common';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class LayoutService {
  constructor(private settingsService: SettingsService) { }

  async getLayout() {
    const pageLayout = await this.settingsService
      .findOneSettings('layout')
      .catch(() => ({}));
    const authLayout = await this.settingsService
      .findOneSettings('signin_signup')
      .catch(() => ({}));
    const versionSetting: any = await this.settingsService
      .findOneSettings('version')
      .catch(() => ({}));
    return {
      customScrollbars: false,
      direction: 'ltr',
      theme: {
        main: {
          palette: {
            mode: 'light',
            text: {
              primary: 'rgb(17, 24, 39)',
              secondary: 'rgb(107, 114, 128)',
              disabled: 'rgb(149, 156, 169)',
            },
            common: {
              black: 'rgb(17, 24, 39)',
              white: 'rgb(255, 255, 255)',
            },
            primary: {
              light: '#64748b',
              main: '#1e293b',
              dark: '#0f172a',
              contrastDefaultColor: 'light',
              contrastText: 'rgb(255,255,255)',
            },
            secondary: {
              light: '#818cf8',
              main: '#4f46e5',
              dark: '#3730a3',
              contrastText: 'rgb(255,255,255)',
            },
            background: {
              paper: '#FFFFFF',
              default: '#f1f5f9',
            },
            error: {
              light: '#ffcdd2',
              main: '#f44336',
              dark: '#b71c1c',
              contrastText: 'rgb(255,255,255)',
            },
            divider: '#e2e8f0',
          },
        },
        navbar: {
          palette: {
            mode: 'dark',
            text: {
              primary: 'rgb(255,255,255)',
              secondary: 'rgb(148, 163, 184)',
              disabled: 'rgb(156, 163, 175)',
            },
            common: {
              black: 'rgb(17, 24, 39)',
              white: 'rgb(255, 255, 255)',
            },
            primary: {
              light: '#64748b',
              main: '#334155',
              dark: '#0f172a',
              contrastDefaultColor: 'light',
              contrastText: 'rgb(255,255,255)',
            },
            secondary: {
              light: '#818cf8',
              main: '#4f46e5',
              dark: '#3730a3',
              contrastText: 'rgb(255,255,255)',
            },
            background: {
              paper: '#1e293b',
              default: '#111827',
            },
            error: {
              light: '#ffcdd2',
              main: '#f44336',
              dark: '#b71c1c',
            },
            divider: 'rgba(241,245,249,.12)',
          },
        },
        toolbar: {
          palette: {
            mode: 'light',
            text: {
              primary: 'rgb(17, 24, 39)',
              secondary: 'rgb(107, 114, 128)',
              disabled: 'rgb(149, 156, 169)',
            },
            common: {
              black: 'rgb(17, 24, 39)',
              white: 'rgb(255, 255, 255)',
            },
            primary: {
              light: '#64748b',
              main: '#1e293b',
              dark: '#0f172a',
              contrastDefaultColor: 'light',
              contrastText: 'rgb(255,255,255)',
            },
            secondary: {
              light: '#818cf8',
              main: '#4f46e5',
              dark: '#3730a3',
              contrastText: 'rgb(255,255,255)',
            },
            background: {
              paper: '#FFFFFF',
              default: '#f1f5f9',
            },
            error: {
              light: '#ffcdd2',
              main: '#f44336',
              dark: '#b71c1c',
              contrastText: 'rgb(255,255,255)',
            },
            divider: '#e2e8f0',
          },
        },
        footer: {
          palette: {
            mode: 'dark',
            text: {
              primary: 'rgb(255,255,255)',
              secondary: 'rgb(148, 163, 184)',
              disabled: 'rgb(156, 163, 175)',
            },
            common: {
              black: 'rgb(17, 24, 39)',
              white: 'rgb(255, 255, 255)',
            },
            primary: {
              light: '#64748b',
              main: '#334155',
              dark: '#0f172a',
              contrastDefaultColor: 'light',
              contrastText: 'rgb(255,255,255)',
            },
            secondary: {
              light: '#818cf8',
              main: '#4f46e5',
              dark: '#3730a3',
              contrastText: 'rgb(255,255,255)',
            },
            background: {
              paper: '#1e293b',
              default: '#111827',
            },
            error: {
              light: '#ffcdd2',
              main: '#f44336',
              dark: '#b71c1c',
            },
            divider: 'rgba(241,245,249,.12)',
          },
        },
      },
      layout: {
        style: 'layout1',
        config: {
          mode: 'container',
          containerWidth: 1570,
          navbar: {
            display: true,
            style: 'style-1',
            folded: true,
            position: 'left',
            open: true,
          },
          toolbar: {
            display: true,
            style: 'fixed',
            position: 'below',
          },
          footer: {
            display: true,
            style: 'fixed',
          },
          leftSidePanel: {
            display: true,
          },
          rightSidePanel: {
            display: true,
          },
          scroll: 'content',
        },
      },
      defaultAuth: ['admin'],
      loginRedirectUrl: '/',
      authLayout: authLayout?.settings?.layout || 'modern',
      cloudFrontUrl: 'https://dmyhz7upeha6d.cloudfront.net',
      version: versionSetting?.settings?.version || 1,
      B2B:(process.env.B2B === 'false') ? false : true 
    };
  }
}
