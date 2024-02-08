import os

def define_env(env):
    @env.macro
    def tenant():
        return os.getenv('TENANT', 'tenant')
    @env.macro
    def if_tenant():
        if tenant() == 'tenant':
           return '!!! info\n' + \
            '     This is a generic version of the NAIS documentation available to the public.<br> '+ \
            'If you are currently using NAIS, go to the documentation tailored for your organization.<br> '+ \
            'https://doc.&lt;org&gt;.cloud.nais.io<br>'+ \
            '<button data-action="configure-redirect" class="md-button md-button--primary">Configure automatic redirect</button>'

        else:
            return ''
