import { spawn } from 'child_process'

const SCRIPTS = {
  hello_world: 'hello_world.py',
  gusto: 'gusto.py',
}

export type AvailableScript = keyof typeof SCRIPTS

export async function helloWorld(): Promise<string> {
  try {
    const res = await runPy(SCRIPTS.hello_world, ['world'])
    return res
  } catch (error) {
    return error as string
  }
}

export async function gusto(): Promise<string> {
  try {
    const res = await runPy(SCRIPTS.gusto, [JSON.stringify({ a: 1234, b: '12345', c: 'marco' })])
    return JSON.parse(res)
  } catch (error) {
    return error as string
  }
}

// Do not change this method

const runPy = (script: string, parameters: any[] = []) =>
  new Promise<string>(function (success, nosuccess) {
    const pyprog = spawn('python3', [`src/py-modules/${script}`, ...parameters])

    pyprog.stdout.on('data', function (data: string) {
      success(data.toString())
    })

    pyprog.stderr.on('data', (data: string) => {
      console.error(data.toString())
      nosuccess(data.toString())
    })
  })
