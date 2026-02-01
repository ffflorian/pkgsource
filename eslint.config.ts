import config from '@ffflorian/eslint-config';
import {defineConfig} from 'eslint/config';

export default defineConfig([config, {rules: {'no-magic-numbers': 'off'}}]);
