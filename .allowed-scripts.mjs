import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    'node_modules/fsevents@2.3.3': 'ALLOW',
    'node_modules/unrs-resolver@1.9.2': 'ALLOW'
  },
})
