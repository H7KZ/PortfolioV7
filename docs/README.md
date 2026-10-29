# Documentation

Start at the root [README](../README.md) for what the project is and how to run it locally. Operational docs follow the shape shared by every repository that deploys with the toolkit (the [repository standard](https://github.com/H7KZ/Toolkit/tree/main/docs/standard.md)).

## Runbooks

| I need to                                                    | Read                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| bring a clean VPS to a running site, or move servers         | [Fresh server](runbooks/fresh-server.md)                   |
| ship code: workflows, inputs, stage and activate             | [Deploy and release](runbooks/deploy-and-release.md)       |
| undo a release, reconcile, restore after an incident         | [Rollback and recovery](runbooks/rollback-and-recovery.md) |
| set up, check or restore backups                             | [Backups](runbooks/backups.md)                             |
| add a container or a deploy target                           | [Add a service](runbooks/add-a-service.md)                 |
| create or rotate a secret or variable                        | [Secrets and config](runbooks/secrets-and-config.md)       |
| choose or change where ingress runs                          | [Split to own server](runbooks/split-to-own-server.md)     |
| review a Dependabot PR, handle a major, move the toolkit pin | [Dependency updates](runbooks/dependency-updates.md)       |
| diagnose a failure                                           | [Troubleshooting](runbooks/troubleshooting.md)             |
| import V6 content into a new, empty CMS (one time)           | [V6 content import](runbooks/content-import.md)            |
| write the V7 redesign copy and images into the CMS           | [V7 content seed](runbooks/v7-content-seed.md)             |

## Redesign

The V7 redesign contract is [redesign/SPEC.md](redesign/SPEC.md), with tasks in [TASKS.md](redesign/TASKS.md) and the build loop in [LOOP.md](redesign/LOOP.md).

## Architecture decisions

| ADR                                     | Decision                                         |
| --------------------------------------- | ------------------------------------------------ |
| [0001](adr/0001-repository-standard.md) | repository standard, ingress modes, naming rules |

## Elsewhere

- [Deployment README](../deployment/README.md): file map of the stacks, toolkit integration and targets.
- [Toolkit docs](https://github.com/H7KZ/Toolkit/tree/main/docs): mechanics of releases, hosts, backups and conventions; not repeated here.
