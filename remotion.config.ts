import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(1); // لو الـ server صغير — زوده لو عندك CPU أكتر
Config.setChromiumOpenGlRenderer('swiftshader'); // مهم جداً في GitHub Actions (headless)
