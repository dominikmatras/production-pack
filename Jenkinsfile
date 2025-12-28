pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    ORG = "dominikmatras-tech"
    GHCR = "ghcr.io"

    APP_REPO = "https://github.com/dominikmatras/production-pack.git"
    GITOPS_REPO = "https://github.com/dominikmatras/production-pack-k8s.git"
    VALUES_FILE = "apps/production-pack/values-prod.yaml"
  }

  stages {

    stage("Checkout app repo") {
      steps {
        deleteDir()
        git branch: "main", url: "${APP_REPO}"
        script {
          env.TAG = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        }
        echo "Build tag: ${env.TAG}"
      }
    }

    stage("Login GHCR") {
      steps {
        withCredentials([usernamePassword(credentialsId: "ghcr-creds", usernameVariable: "GH_USER", passwordVariable: "GH_TOKEN")]) {
          sh '''
            set -e
            echo "$GH_TOKEN" | docker login ghcr.io -u "$GH_USER" --password-stdin
          '''
        }
      }
    }

    stage("Build & Push backend images") {
      steps {
        sh '''
          set -e

          docker build -t ${GHCR}/${ORG}/user-service:$TAG backend/user-service
          docker push ${GHCR}/${ORG}/user-service:$TAG

          docker build -t ${GHCR}/${ORG}/order-service:$TAG backend/order-service
          docker push ${GHCR}/${ORG}/order-service:$TAG

          docker build -t ${GHCR}/${ORG}/production-service:$TAG backend/production-service
          docker push ${GHCR}/${ORG}/production-service:$TAG

          docker build -t ${GHCR}/${ORG}/report-service:$TAG backend/report-service
          docker push ${GHCR}/${ORG}/report-service:$TAG

          docker build -t ${GHCR}/${ORG}/api-gateway:$TAG backend/api-gateway
          docker push ${GHCR}/${ORG}/api-gateway:$TAG
        '''
      }
    }

    stage("Build & Push frontend image") {
      steps {
        sh '''
          set -e
          docker build -t ${GHCR}/${ORG}/frontend:$TAG frontend
          docker push ${GHCR}/${ORG}/frontend:$TAG
        '''
      }
    }

    stage("Checkout GitOps repo") {
      steps {
        sh 'rm -rf gitops || true'
        withCredentials([usernamePassword(credentialsId: "github-creds", usernameVariable: "GIT_USER", passwordVariable: "GIT_TOKEN")]) {
          sh '''
            set -e
            git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/dominikmatras/production-pack-k8s.git gitops
            cd gitops
            git checkout main
          '''
        }
      }
    }

    stage("Update image tags in GitOps values") {
      steps {
        sh '''
          set -e
          cd gitops

          # install yq if missing (linux amd64)
          if ! command -v yq >/dev/null 2>&1; then
            wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/download/v4.44.3/yq_linux_amd64
            chmod +x /usr/local/bin/yq
          fi

          yq -i '.frontend.image.tag = strenv(TAG)' ${VALUES_FILE}
          yq -i '.gateway.image.tag = strenv(TAG)' ${VALUES_FILE}

          yq -i '.services."user-service".image.tag = strenv(TAG)' ${VALUES_FILE}
          yq -i '.services."order-service".image.tag = strenv(TAG)' ${VALUES_FILE}
          yq -i '.services."production-service".image.tag = strenv(TAG)' ${VALUES_FILE}
          yq -i '.services."report-service".image.tag = strenv(TAG)' ${VALUES_FILE}

          echo "Changed files:"
          git status --porcelain || true
        '''
      }
    }

    stage("Commit & Push GitOps") {
      steps {
        withCredentials([usernamePassword(credentialsId: "github-creds", usernameVariable: "GIT_USER", passwordVariable: "GIT_TOKEN")]) {
          sh '''
            set -e
            cd gitops

            git config user.name "jenkins"
            git config user.email "jenkins@dm-tech.pl"

            if [ -n "$(git status --porcelain)" ]; then
              git add ${VALUES_FILE}
              git commit -m "chore(prod): bump images to ${TAG}"
              git push https://${GIT_USER}:${GIT_TOKEN}@github.com/dominikmatras/production-pack-k8s.git main
            else
              echo "No changes to commit."
            fi
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout ghcr.io || true'
    }
  }
}
