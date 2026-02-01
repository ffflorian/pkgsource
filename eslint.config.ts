import config from '@ffflorian/eslint-config';
import {Config, defineConfig} from 'eslint/config';

export default defineConfig([config as Config, {rules: {'no-magic-numbers': 'off'}}]);
