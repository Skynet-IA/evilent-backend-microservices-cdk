import 'package:flutter_dotenv/flutter_dotenv.dart';

final amplifyconfig = '''
{
    "auth": {
        "plugins": {
            "awsCognitoAuthPlugin": {
                "CognitoUserPool": {
                    "Default": {
                        "PoolId": "${dotenv.env['COGNITO_POOL_ID']}",
                        "AppClientId": "${dotenv.env['COGNITO_APP_CLIENT_ID']}",
                        "Region": "${dotenv.env['COGNITO_REGION']}"
                    }
                }
            }
        }
    }
}
''';