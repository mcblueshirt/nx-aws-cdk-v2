import { SynthesizeExecutorSchema } from './schema';
import { createCommand, runCommandProcess, parseArgs } from '../../utils/executor.util';
import { ParsedExecutorInterface } from '../../interfaces/parsed-executor.interface';
import { ExecutorContext } from '@nx/devkit';

export interface ParsedSynthesizeExecutorOption extends ParsedExecutorInterface {
  stacks?: string[];
  sourceRoot: string;
  root: string;
}

export default async function runExecutor(options: SynthesizeExecutorSchema, context: ExecutorContext) {
  const normalizedOptions = normalizeOptions(options, context);
  const result = await runSynthesize(normalizedOptions, context);

  return {
    success: result,
  };
}

async function runSynthesize(options: ParsedSynthesizeExecutorOption, context: ExecutorContext) {
  const command = createCommand('synthesize', options);
  return runCommandProcess(command, context.root);
}

function normalizeOptions(options: SynthesizeExecutorSchema, context: ExecutorContext): ParsedSynthesizeExecutorOption {
  const parsedArgs = parseArgs(options);
  let stacks;

  if (Object.prototype.hasOwnProperty.call(options, 'stacks')) {
    stacks = options.stacks;
  }

  // eslint-disable-next-line no-unsafe-optional-chaining
  const { sourceRoot, root } = context?.workspace?.projects[context.projectName];

  return {
    ...options,
    parseArgs: parsedArgs,
    stacks,
    sourceRoot,
    root,
  };
}
