import os
import textwrap


def define_env(env):
    @env.macro
    def tenant():
        return os.getenv('TENANT', 'tenant')

    @env.macro
    def tenant_url(app: str, path: str = ''):
        if tenant() == 'nav' and app == 'cdn':
            return f'https://cdn.nav.no/{path}'

        return f'https://{app}.{tenant()}.cloud.nais.io/{path}'

    @env.macro
    def gcp_only(feature: str):
        if tenant() == "nav":
            return textwrap.dedent(f"""\
            !!! gcp-only "{feature} is only available in GCP"
            
                {feature} is only available in GCP clusters, and will not work in on-prem clusters.    
            """)
        return ""

    @env.macro
    def naisdevice_name():
        if tenant() == "nav":
            return "naisdevice"

        return "naisdevice-tenant"
