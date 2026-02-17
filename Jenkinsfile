/* Requires the Docker Pipeline plugin */
pipeline {
    agent { docker { image 'node:24.13.1-alpine3.23' } }
    stages {
        stage('build') {
            steps {
                sh 'node --version'
            }
        }
    }
}
