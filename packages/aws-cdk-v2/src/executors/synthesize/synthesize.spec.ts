import * as childProcess from 'child_process';
import { logger } from '@nx/devkit';

import executor from './synthesize';
import { SynthesizeExecutorSchema } from './schema';
import { generateCommandString, LARGE_BUFFER } from '../../utils/executor.util';
import { mockExecutorContext } from '../../utils/testing';

const options: SynthesizeExecutorSchema = {};

const nodeCommandWithRelativePath = generateCommandString('synthesize', 'apps/proj');

describe('aws-cdk-v2 synthesize Executor', () => {
  const context = mockExecutorContext('synthesize');

  beforeEach(async () => {
    jest.spyOn(logger, 'debug');
    jest.spyOn(childProcess, 'exec');
  });

  afterEach(() => jest.clearAllMocks());

  it('run cdk synthesize command', async () => {
    await executor(options, context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      nodeCommandWithRelativePath,
      expect.objectContaining({
        cwd: context.root,
        env: process.env,
        maxBuffer: LARGE_BUFFER,
      })
    );
    expect(logger.debug).toHaveBeenLastCalledWith(`Executing command: ${nodeCommandWithRelativePath}`);
  });

  it('run cdk synthesize command stack', async () => {
    const option: SynthesizeExecutorSchema = Object.assign({}, options);
    const stackName = 'test';
    option['stacks'] = stackName;
    await executor(option, context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      `${nodeCommandWithRelativePath} ${stackName}`,
      expect.objectContaining({
        env: process.env,
        maxBuffer: LARGE_BUFFER,
      })
    );

    expect(logger.debug).toHaveBeenLastCalledWith(`Executing command: ${nodeCommandWithRelativePath} ${stackName}`);
  });

  it('run cdk synthesize command context options', async () => {
    const option: SynthesizeExecutorSchema = Object.assign({}, options);
    const contextOptionString = 'key=value';
    option['context'] = contextOptionString;
    await executor(option, context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      `${nodeCommandWithRelativePath} --context ${contextOptionString}`,
      expect.objectContaining({
        env: process.env,
        maxBuffer: LARGE_BUFFER,
      })
    );

    expect(logger.debug).toHaveBeenLastCalledWith(
      `Executing command: ${nodeCommandWithRelativePath} --context ${contextOptionString}`
    );
  });

  it('run cdk synthesize command with multiple context options', async () => {
    const option: SynthesizeExecutorSchema = Object.assign({}, options);
    const contextOptions = ['firstKey=firstValue', 'secondKey=secondValue'];
    option['context'] = contextOptions;
    await executor(option, context);

    const contextCmd = contextOptions.map((option) => `--context ${option}`).join(' ');
    expect(childProcess.exec).toHaveBeenCalledWith(
      `${nodeCommandWithRelativePath} ${contextCmd}`,
      expect.objectContaining({
        env: process.env,
        maxBuffer: LARGE_BUFFER,
      })
    );

    expect(logger.debug).toHaveBeenLastCalledWith(`Executing command: ${nodeCommandWithRelativePath} ${contextCmd}`);
  });

  it('run cdk synthesize command with boolean context option', async () => {
    const option: SynthesizeExecutorSchema = Object.assign({}, options);
    option['context'] = true;
    await executor(option, context);

    expect(childProcess.exec).toHaveBeenCalledWith(
      `${nodeCommandWithRelativePath} --context true`,
      expect.objectContaining({
        env: process.env,
        maxBuffer: LARGE_BUFFER,
      })
    );

    expect(logger.debug).toHaveBeenLastCalledWith(`Executing command: ${nodeCommandWithRelativePath} --context true`);
  });
});
