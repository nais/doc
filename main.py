import os


def define_env(env):
    @env.macro
    def tenant():
        return os.getenv('TENANT', 'tenant')

    @env.macro
    def tenant_url(app: str, path: str = ''):
        return f'https://{app}.{tenant()}.cloud.nais.io/{path}'
