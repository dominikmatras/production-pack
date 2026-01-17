def trivyScanImage(String imageRef) {
  withEnv(["IMAGE_REF=${imageRef}"]) {
    sh '''#!/bin/sh
      set -eu

      mkdir -p .trivy-cache

      echo "[TRIVY] Scanning: $IMAGE_REF"
      docker run --rm \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v "$PWD/.trivy-cache:/root/.cache/" \
        aquasec/trivy:latest \
        image --no-progress \
        --severity CRITICAL \
        --exit-code 1 \
        --ignore-unfixed \
        "$IMAGE_REF"
    '''
  }
}

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

    stage("Build, Scan & Push backend images") {
      steps {
        script {
          def images = [
            [name: "user-service",       ctx: "backend/user-service"],
            [name: "order-service",      ctx: "backend/order-service"],
            [name: "production-service", ctx: "backend/production-service"],
            [name: "report-service",     ctx: "backend/report-service"],
            [name: "api-gateway",        ctx: "backend/api-gateway"],
          ]

          for (img in images) {
            def imageRef = "${env.GHCR}/${env.ORG}/${img.name}:${env.TAG}"

            sh """#!/bin/sh
              set -eu
              echo "[BUILD] ${imageRef}"
              docker build -t ${imageRef} ${img.ctx}
            """

            trivyScanImage(imageRef)

            sh """#!/bin/sh
              set -eu
              echo "[PUSH] ${imageRef}"
              docker push ${imageRef}
            """
          }
        }
      }
    }

    stage("Build & Push frontend image") {
      steps {
        script {
          def imageRef = "${env.GHCR}/${env.ORG}/frontend:${env.TAG}"

          sh """#!/bin/sh
            set -eu
            echo "[BUILD] ${imageRef}"
            docker build -t ${imageRef} frontend
          """

          trivyScanImage(imageRef)

          sh """#!/bin/sh
            set -eu
            echo "[PUSH] ${imageRef}"
            docker push ${imageRef}
          """
        }
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

          FILE="${VALUES_FILE}"

          replace_tag_by_repo() {
            local repo="$1"
            local newtag="$2"

            awk -v repo="$repo" -v newtag="$newtag" '
              BEGIN { inblock=0 }
              {
                if ($0 ~ "repository:[[:space:]]*"repo"$") {
                  inblock=1
                  print
                  next
                }

                if (inblock==1 && $0 ~ /^[[:space:]]*tag:[[:space:]]*/) {
                  indent=$0
                  sub(/[^[:space:]].*$/,"",indent)
                  print indent "tag: " newtag
                  inblock=0
                  next
                }

                if (inblock==1 && $0 ~ /^[^[:space:]]/) { inblock=0 }
                print
              }
            ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
          }

          replace_tag_by_repo "ghcr.io/${ORG}/frontend" "$TAG"
          replace_tag_by_repo "ghcr.io/${ORG}/api-gateway" "$TAG"
          replace_tag_by_repo "ghcr.io/${ORG}/user-service" "$TAG"
          replace_tag_by_repo "ghcr.io/${ORG}/order-service" "$TAG"
          replace_tag_by_repo "ghcr.io/${ORG}/production-service" "$TAG"
          replace_tag_by_repo "ghcr.io/${ORG}/report-service" "$TAG"

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
              git commit -m "Jenkins CI: Bump images to ${TAG}"
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
