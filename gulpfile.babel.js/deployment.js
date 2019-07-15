import { src, dest, series, parallel } from 'gulp';
import del from 'del';
import { clean } from './clean';
import Git from 'nodegit';

function fetchRemoteSrc(cb) {
    let repository;
    Git.Repository
        .open(".")
        .then(function(repo) {
            repository = repo;
            return repo.fetchAll("origin");
        })
        .then(function () {
            return repository.mergeBranches("src", "origin/src");
        })
        .then(function () {
            cb();
        });
}

function fetchRemoteMaster(cb) {
    let repository;
    Git.Repository
        .open(".")
        .then(function(repo) {
            repository = repo;
            return repo.fetchAll("origin");
        })
        .then(function () {
            return repository.mergeBranches("master", "origin/master");
        })
        .then(function () {
            cb();
        });
}

function cloneSrcRepoToDist(cb) {
    return src(['.git/**/*'])
      .pipe(dest('./dist/.git'));
}

function checkoutMasterOnDist(cb) {
    Git.Repository
        .open('./dist')
        .then(function (repository) {
            repository.getBranch('refs/heads/master')
            .then(function (reference) {
                repository.checkoutRef(reference)
                .then(function () {
                    done();
                    cb();
                });
            });
        });
}

function cleanWorkingTreeOnDist(cb) {
    del(['dist/**/*', '!.git']).then(() => cb());
}

let preBuild = series(fetchRemoteSrc, fetchRemoteMaster, cloneSrcRepoToDist, checkoutMasterOnDist, cleanWorkingTreeOnDist);

let commit;
function addAndCommitDistToMaster(cb) {
    let repo;
    let index;
    let oid;
    Git.Repository
        .open('./dist')
        .then(function(repoResult) {
            repo = repoResult;
            return repo.refreshIndex();
        })
        .then(function(indexResult) {
            index = indexResult;
            return index.addAll('.');
        })
        .then(function() {
            //write files to index
            return index.write();
        })
        .then(function() {
            return index.writeTree();
        })
        .then(function(oidResult) {
            oid = oidResult;
            return Git.Reference.nameToId(repo, "HEAD");
        })
        .then(function(head) {
            return repo.getCommit(head);
        })
        .then(function(parent) {
            // var author = nodegit.Signature.create("Scott Chacon",
            //   "schacon@gmail.com", 123456789, 60);
            // var committer = nodegit.Signature.create("Scott A Chacon",
            //   "scott@github.com", 987654321, 90);
            var author = Git.Signature.default(repo);
            var committer = Git.Signature.default(repo);
            message = "Build saved automatically on " + moment().format('MMMM DD, YYYY @ hh:mm:ss.SSS a' + '.');
            return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
        })
        .then(function(commitId) {
            commit = commitId;
            console.log("Created new commit", commit, "with message:");
            console.log(message);
            done();
            cb();
        });
}

function addAndCommitSrc(cb) {
    let repo;
    let index;
    let oid;
    Git.Repository
        .open('.')
        .then(function(repoResult) {
            repo = repoResult;
            return repo.refreshIndex();
        })
        .then(function(indexResult) {
            index = indexResult;
            return index.addAll('.');
        })
        .then(function() {
            return index.write();
        })
        .then(function() {
            return index.writeTree();
        })
        .then(function(oidResult) {
            oid = oidResult;
            return Git.Reference.nameToId(repo, "HEAD");
        })
        .then(function(head) {
            return repo.getCommit(head);
        })
        .then(function(parent) {
            var author = Git.Signature.default(repo);
            var committer = Git.Signature.default(repo);
            message = "Source saved from automatic build " + moment().format('MMMM DD, YYYY @ hh:mm:ss.SSS a' + '.');
            return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
        })
        .then(function(commitId) {
            console.log("Created new commit", commitId, "with message:");
            console.log(message);
            cb();
        });
}

function pushDistToRemoteMaster(cb) {
    Git.Repository
        .open('./dist')
        .then(function (repo) {
          return repo.getRemote('origin');
        })
        .then(function (remote) {
          return remote.push(['refs/heads/master:refs/heads/master'], {
      
          });
        })
        .done(function (e) {
          if (e)
            console.error("Push failed with", e);
          cb();
        });
    //   git.push('origin', 'master', { cwd: './dist' }, function (e) {
    //     if (e)
    //       console.error(e);
            // cb();
    //   });
}
    
function pushSrcToRemoteSrc(cb) {
    Git.Repository
        .open('.')
        .then(function (repo) {
          return repo.getRemote('origin');
        })
        .then(function (remote) {
          return remote.push(['refs/heads/src:refs/heads/src']);
        })
        .done(function (e) {
          if (e)
            console.error("Push failed with", e);
          cb();
        });
    //   git.push('origin', 'src', { cwd: './' }, function (e) {
    //     if (e)
    //       console.error(e);
            // cb();
    //   });
}

let postBuild = series(addAndCommitDistToMaster, addAndCommitSrc, pushDistToRemoteMaster, pushSrcToRemoteSrc);

export { preBuild, postBuild };