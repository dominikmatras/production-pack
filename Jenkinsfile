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
        sh 'git rev-parse --short HEAD > .tag'
        script {
          env.TAG = readFile(".tag").trim()
        }
        echo "Build tag: ${env.TAG}"
      }
    }

    stage("Login GHCR") {
      steps {
        withCredentials([string(credentialsId: "ghcr-creds", variable: "GH_TOKEN")]) {
          sh """
            echo "$GH_TOKEN" | docker login ${GHCR} -u ${ORG} --password-stdin
          """
        }
      }
    }

    stage("Build & Push backend images") {
      steps {
        script {
          def services = [
            [name: "user-service",       path: "backend/user-service"],
            [name: "order-service",      path: "backend/order-service"],
            [name: "production-service", path: "backend/production-service"],
            [name: "report-service",     path: "backend/report-service"],
            [name: "api-gateway",        path: "backend/api-gateway"],
          ]

          for (svc in services) {
            sh """
              set -e
              docker build -t ${GHCR}/${ORG}/${svc.name}:${TAG} ${svc.path}
              docker push ${GHCR}/${ORG}/${svc.name}:${TAG}
            """
          }
        }
      }
    }

    stage("Build & Push frontend image") {
      steps {
        sh """
          set -e
          docker build -t ${GHCR}/${ORG}/frontend:${TAG} frontend
          docker push ${GHCR}/${ORG}/frontend:${TAG}
        """
      }
    }

    stage("Checkout GitOps repo") {
      steps {
        dir("gitops") {
          withCredentials([string(credentialsId: "github-creds", variable: "GITOPS_TOKEN")]) {
            sh """
              git clone https://x-access-token:${GITOPS_TOKEN}@github.com/dominikmatras/production-pack-k8s.git .
              git checkout main
            """
          }
        }
      }
    }

    stage("Update image tags in GitOps values") {
      steps {
        dir("gitops") {
          sh """
            if ! command -v yq >/dev/null 2>&1; then
              wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/download/v4.44.3/yq_linux_amd64
              chmod +x /usr/local/bin/yq
            fi
          """

          sh """
            set -e

            yq -i '.frontend.image.tag = strenv(TAG)' ${VALUES_FILE}
            yq -i '.gateway.image.tag = strenv(TAG)' ${VALUES_FILE}

            yq -i '.services."user-service".image.tag = strenv(TAG)' ${VALUES_FILE}
            yq -i '.services."order-service".image.tag = strenv(TAG)' ${VALUES_FILE}
            yq -i '.services."production-service".image.tag = strenv(TAG)' ${VALUES_FILE}
            yq -i '.services."report-service".image.tag = strenv(TAG)' ${VALUES_FILE}

            git status --porcelain
          """
        }
      }
    }

    stage("Commit & Push GitOps") {
      steps {
        dir("gitops") {
          withCredentials([string(credentialsId: "github-creds", variable: "GITOPS_TOKEN")]) {
            sh """
              set -e
              git config user.name "Jenkins CI"
              git config user.email "jenkins@dm-tech.pl"

              if [ -n "$(git status --porcelain)" ]; then
                git add ${VALUES_FILE}
                git commit -m "chore(prod): bump images to ${TAG}"
                git push https://x-access-token:${GITOPS_TOKEN}@github.com/dominikmatras/production-pack-k8s.git main
              else
                echo "No changes to commit."
              fi
            """
          }
        }
      }
    }
  }

  post {
    always {
      sh "docker logout ${GHCR} || true"
    }
  }
}
